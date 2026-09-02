import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/PrintButton";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const supabase = createClient();

  const from = searchParams.from ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const to = searchParams.to ?? new Date().toISOString().slice(0, 10);

  const [{ data: profile }, { data: transactions }, { data: goals }, { data: accounts }] = await Promise.all([
    supabase.auth.getUser().then(async ({ data }) => {
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", data.user!.id).single();
      return { data: p };
    }),
    supabase
      .from("transactions")
      .select("occurred_at, description, amount, category:categories(name)")
      .gte("occurred_at", from)
      .lte("occurred_at", to)
      .order("occurred_at"),
    supabase.from("goals").select("*"),
    supabase.from("accounts").select("initial_balance").eq("archived", false),
  ]);

  type Row = { amount: number; category: { name: string } | { name: string }[] | null };
  const rows = (transactions ?? []) as unknown as Row[];

  const income = rows.filter((t) => t.amount > 0).reduce((s, t) => s + Number(t.amount), 0);
  const expense = rows.filter((t) => t.amount < 0).reduce((s, t) => s + Number(t.amount), 0);

  const byCategory: Record<string, number> = {};
  for (const t of rows) {
    if (t.amount >= 0) continue;
    const cat = Array.isArray(t.category) ? t.category[0] : t.category;
    const name = cat?.name ?? "Sem categoria";
    byCategory[name] = (byCategory[name] ?? 0) + Math.abs(Number(t.amount));
  }
  const categoryRows = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCategory = Math.max(...categoryRows.map(([, v]) => v), 1);

  const periodLabel = `${new Date(from + "T00:00:00").toLocaleDateString("pt-BR")} a ${new Date(to + "T00:00:00").toLocaleDateString("pt-BR")}`;

  return (
    <div className="min-h-screen bg-paper text-ink px-6 py-10 flex justify-center print:bg-white">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="w-full max-w-2xl">
        <div className="no-print flex justify-between items-center mb-8">
          <a href="/dashboard/export" className="text-sm text-ink-soft hover:text-ink">
            ← Voltar
          </a>
          <PrintButton />
        </div>

        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-[9px] bg-brand flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-paper-raised" fill="none" strokeWidth="1.8">
              <path d="M4 18 L10 10 L14 14 L20 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display text-lg">Contando Centavos</span>
        </div>

        <div className="mb-10">
          <div className="text-xs font-semibold text-ink-faint mb-1">Relatório financeiro</div>
          <h1 className="font-display text-2xl font-medium mb-1">
            {(profile as { full_name: string } | null)?.full_name ?? "Relatório"}
          </h1>
          <p className="text-sm text-ink-soft">{periodLabel}</p>
        </div>

        <div className="flex gap-10 mb-10 pb-8 border-b border-hairline flex-wrap">
          <div>
            <div className="text-xs font-semibold text-ink-faint mb-1">Receitas</div>
            <div className="font-display text-2xl" style={{ color: "rgb(var(--brand))" }}>
              {formatCurrency(income)}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-faint mb-1">Despesas</div>
            <div className="font-display text-2xl" style={{ color: "rgb(var(--wine))" }}>
              {formatCurrency(Math.abs(expense))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-faint mb-1">Saldo do período</div>
            <div className="font-display text-2xl">{formatCurrency(income + expense)}</div>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-[15.5px] font-bold mb-4">Gastos por categoria</h3>
          {categoryRows.length === 0 && <p className="text-sm text-ink-faint">Sem despesas no período.</p>}
          <div className="flex flex-col gap-3">
            {categoryRows.map(([name, value]) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{name}</span>
                  <span className="font-display">{formatCurrency(value)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-hairline/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(value / maxCategory) * 100}%`, background: "rgb(var(--wine))" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {goals && goals.length > 0 && (
          <div className="mb-10">
            <h3 className="text-[15.5px] font-bold mb-4">Metas</h3>
            <div className="flex flex-col gap-3">
              {goals.map((g) => {
                const pct = Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100);
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{g.name}</span>
                      <span className="font-display" style={{ color: "rgb(var(--gold))" }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-hairline/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: "rgb(var(--gold))" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-hairline text-xs text-ink-faint">
          Gerado em {new Date().toLocaleDateString("pt-BR")} · contando-centavos.vercel.app
        </div>
      </div>
    </div>
  );
}
