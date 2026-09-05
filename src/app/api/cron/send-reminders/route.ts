import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export const dynamic = "force-dynamic";

// Roda diariamente via Vercel Cron (ver vercel.json). Verifica despesas
// vencendo nos próximos 3 dias e envia push pras assinaturas daquela
// household. Usa a service_role key — só existe nesse contexto de servidor,
// nunca é enviada ao navegador.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  webpush.setVapidDetails(
    "mailto:contato@contandocentavos.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const today = new Date().toISOString().slice(0, 10);
  const in3Days = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);

  const { data: bills } = await supabase
    .from("bills")
    .select("household_id, description, amount, due_date")
    .neq("status", "pago")
    .lte("due_date", in3Days);

  if (!bills || bills.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const billsByHousehold = new Map<string, typeof bills>();
  for (const bill of bills) {
    const list = billsByHousehold.get(bill.household_id) ?? [];
    list.push(bill);
    billsByHousehold.set(bill.household_id, list);
  }

  let sent = 0;

  for (const [householdId, householdBills] of billsByHousehold) {
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("household_id", householdId);

    if (!subscriptions || subscriptions.length === 0) continue;

    const overdue = householdBills.filter((b) => b.due_date < today);
    const title = overdue.length > 0 ? "Você tem contas atrasadas" : "Contas vencendo em breve";
    const body =
      householdBills.length === 1
        ? `${householdBills[0].description} — vence em ${new Date(householdBills[0].due_date + "T00:00:00").toLocaleDateString("pt-BR")}`
        : `${householdBills.length} contas precisam de atenção nos próximos dias.`;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          JSON.stringify({ title, body, url: "/dashboard" })
        );
        sent++;
      } catch {
        // Subscription expirada/inválida — remove pra não tentar de novo
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }

  return NextResponse.json({ sent });
}
