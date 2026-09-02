import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { computePosition, compoundInterest } from "@/lib/investmentMath";
import { formatCurrency } from "@/lib/format";
import type { Investment, InvestmentOperationRow } from "@/lib/types";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  renda_fixa: "Renda fixa",
  acao: "Ações / FIIs",
  cripto: "Cripto",
  fundo: "Fundo",
  outro: "Outro",
};

function monthsBetween(start: string, end: Date): number {
  const s = new Date(start + "T00:00:00");
  return (end.getFullYear() - s.getFullYear()) * 12 + (end.getMonth() - s.getMonth());
}

export default async function InvestmentsPage() {
  const supabase = createClient();

  const [{ data: investments }, { data: operations }] = await Promise.all([
    supabase.from("investments").select("*").order("updated_at", { ascending: false }),
    supabase.from("investment_operations").select("*"),
  ]);

  const opsByInvestment = new Map<string, InvestmentOperationRow[]>();
  for (const op of (operations ?? []) as InvestmentOperationRow[]) {
    const list = opsByInvestment.get(op.investment_id) ?? [];
    list.push(op);
    opsByInvestment.set(op.investment_id, list);
  }

  let totalInvested = 0;
  let totalCurrent = 0;

  const rows = ((investments ?? []) as Investment[]).map((inv) => {
    let currentValue = Number(inv.current_value);
    let profit = 0;

    if (inv.asset_type === "acao" || inv.asset_type === "cripto") {
      const ops = opsByInvestment.get(inv.id) ?? [];
      const currentPrice = Number((inv.details as { current_price?: number })?.current_price ?? 0);
      const position = computePosition(ops, currentPrice);
      currentValue = position.currentValue;
      profit = position.totalProfit;
    } else if (inv.asset_type === "renda_fixa") {
      const details = inv.details as { rate_pct?: number; rate_period?: "mensal" | "anual"; start_date?: string };
      if (details.rate_pct && details.start_date) {
        const months = monthsBetween(details.start_date, new Date());
        const periods = details.rate_period === "anual" ? months / 12 : months;
        currentValue = compoundInterest(Number(inv.invested_amount), details.rate_pct, Math.max(periods, 0));
      }
      profit = currentValue - Number(inv.invested_amount);
    } else {
      profit = currentValue - Number(inv.invested_amount);
    }

    totalInvested += Number(inv.invested_amount);
    totalCurrent += currentValue;

    return { ...inv, computedCurrentValue: currentValue, computedProfit: profit };
  });

  const totalProfit = totalCurrent - totalInvested;
  const totalProfitPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-3xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-6 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <div className="flex justify-between items-start mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-medium mb-1">Investimentos</h1>
            <p className="text-sm text-ink-soft">Seu portfólio consolidado.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/investments/calculators"
              className="px-3 py-2 rounded-lg border border-hairline text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Calculadoras
            </Link>
            <Link
              href="/dashboard/investments/new"
              className="px-3 py-2 rounded-lg bg-brand text-paper-raised text-sm font-semibold hover:opacity-90"
            >
              + Novo
            </Link>
          </div>
        </div>

        {investments && investments.length > 0 && (
          <div className="flex gap-8 mb-9 pb-7 border-b border-hairline flex-wrap">
            <div>
              <div className="text-xs font-semibold text-ink-faint mb-1">Investido</div>
              <div className="font-display text-xl">{formatCurrency(totalInvested)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-ink-faint mb-1">Valor atual</div>
              <div className="font-display text-xl">{formatCurrency(totalCurrent)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-ink-faint mb-1">Lucro / prejuízo</div>
              <div
                className="font-display text-xl"
                style={{ color: totalProfit >= 0 ? "rgb(var(--brand))" : "rgb(var(--wine))" }}
              >
                {formatCurrency(totalProfit)} ({totalProfitPct >= 0 ? "+" : ""}
                {totalProfitPct.toFixed(1)}%)
              </div>
            </div>
          </div>
        )}

        {(!investments || investments.length === 0) && (
          <Link
            href="/dashboard/investments/new"
            className="flex items-center justify-between gap-3 rounded-card border border-dashed border-hairline px-4 py-3.5 text-sm text-ink-soft hover:text-ink transition-colors"
          >
            Nenhum investimento ainda — adicionar o primeiro
          </Link>
        )}

        <div className="flex flex-col gap-2.5">
          {rows.map((inv) => (
            <Link
              key={inv.id}
              href={`/dashboard/investments/${inv.id}`}
              className="flex items-center gap-3.5 rounded-card border border-hairline px-4 py-3.5 hover:border-brand/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{inv.name}</div>
                <div className="text-xs text-ink-faint mt-0.5">{TYPE_LABELS[inv.asset_type]}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-[15px]">{formatCurrency(inv.computedCurrentValue)}</div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: inv.computedProfit >= 0 ? "rgb(var(--brand))" : "rgb(var(--wine))" }}
                >
                  {inv.computedProfit >= 0 ? "+" : ""}
                  {formatCurrency(inv.computedProfit)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
