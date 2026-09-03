import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { currentBillingCycle } from "@/lib/creditCard";
import { formatCurrency } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: account } = await supabase.from("accounts").select("*").eq("id", params.id).single();
  if (!account) notFound();

  if (!account.closing_day || !account.due_day) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 max-w-lg">
          <Link href="/dashboard/accounts" className="text-sm text-ink-soft hover:text-ink">
            ← Voltar
          </Link>
          <p className="text-sm text-ink-faint mt-6">
            Essa conta não tem dia de fechamento/vencimento configurado — isso só se aplica a
            contas do tipo cartão de crédito criadas com esses dados preenchidos.
          </p>
        </main>
      </div>
    );
  }

  const cycle = currentBillingCycle(account.closing_day, account.due_day);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(name, icon)")
    .eq("account_id", params.id)
    .gte("occurred_at", cycle.start)
    .lte("occurred_at", cycle.end)
    .order("occurred_at");

  const total = (transactions ?? []).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-2xl">
        <Link
          href="/dashboard/accounts"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-6 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <h1 className="font-display text-2xl font-medium mb-1">Fatura — {account.name}</h1>
        <p className="text-sm text-ink-soft mb-8">
          Ciclo de {new Date(cycle.start + "T00:00:00").toLocaleDateString("pt-BR")} a{" "}
          {new Date(cycle.end + "T00:00:00").toLocaleDateString("pt-BR")}
        </p>

        <div className="flex gap-8 mb-8 pb-7 border-b border-hairline flex-wrap">
          <div>
            <div className="text-xs font-semibold text-ink-faint mb-1">Total da fatura</div>
            <div className="font-display text-2xl">{formatCurrency(total)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-faint mb-1">Vence em</div>
            <div className="font-display text-2xl">
              {new Date(cycle.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
            </div>
          </div>
        </div>

        {(!transactions || transactions.length === 0) && (
          <p className="text-sm text-ink-faint">Nenhuma compra nesse ciclo ainda.</p>
        )}

        <div>
          {(transactions as Transaction[] | null)?.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-3 border-b border-hairline last:border-none">
              <span className="text-lg shrink-0">{t.category?.icon ?? "🛒"}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                  {t.description}
                  {t.installment_total && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-hairline/15 text-ink-soft shrink-0">
                      {t.installment_number}/{t.installment_total}
                    </span>
                  )}
                </div>
                <div className="text-xs text-ink-faint mt-0.5">
                  {new Date(t.occurred_at + "T00:00:00").toLocaleDateString("pt-BR")}
                </div>
              </div>
              <span className="font-display text-sm shrink-0">{formatCurrency(Math.abs(t.amount))}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
