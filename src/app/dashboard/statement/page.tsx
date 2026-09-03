import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import {
  getPeriodRange,
  shiftAnchor,
  groupByDay,
  groupByMonth,
  formatDayLabel,
  formatMonthKeyLabel,
  type Period,
} from "@/lib/statementPeriods";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

const PERIOD_LABELS: { value: Period; label: string }[] = [
  { value: "dia", label: "Diário" },
  { value: "semana", label: "Semanal" },
  { value: "mes", label: "Mensal" },
  { value: "ano", label: "Anual" },
];

type Row = { id: string; amount: number; occurred_at: string; description: string; category_id: string | null };

export default async function StatementPage({
  searchParams,
}: {
  searchParams: { period?: string; date?: string };
}) {
  const supabase = createClient();

  const period = (searchParams.period as Period) ?? "mes";
  const anchor = searchParams.date ?? new Date().toISOString().slice(0, 10);
  const { start, end, label } = getPeriodRange(period, anchor);

  const [{ data: transactions }, { data: categories }] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, amount, occurred_at, description, category_id")
      .gte("occurred_at", start)
      .lt("occurred_at", end)
      .order("occurred_at", { ascending: false }),
    supabase.from("categories").select("id, name, icon"),
  ]);

  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]));
  const rows = (transactions ?? []) as Row[];

  const income = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = rows.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  const prevHref = `/dashboard/statement?period=${period}&date=${shiftAnchor(period, anchor, -1)}`;
  const nextHref = `/dashboard/statement?period=${period}&date=${shiftAnchor(period, anchor, 1)}`;
  const todayHref = `/dashboard/statement?period=${period}&date=${new Date().toISOString().slice(0, 10)}`;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-6 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <h1 className="font-display text-2xl font-medium mb-1">Extrato</h1>
        <p className="text-sm text-ink-soft mb-6">Todas as entradas e saídas, do jeito que você quiser ver.</p>

        <div className="flex rounded-lg overflow-hidden border border-hairline w-fit mb-5">
          {PERIOD_LABELS.map((p) => (
            <Link
              key={p.value}
              href={`/dashboard/statement?period=${p.value}&date=${anchor}`}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                period === p.value ? "bg-brand text-paper-raised" : "text-ink-soft hover:text-ink"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between mb-7">
          <Link
            href={prevHref}
            className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center hover:bg-hairline/10"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
              <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="text-center">
            <div className="text-sm font-semibold capitalize">{label}</div>
            <Link href={todayHref} className="text-xs text-brand hover:underline">
              Ir para hoje
            </Link>
          </div>
          <Link
            href={nextHref}
            className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center hover:bg-hairline/10"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
              <path d="M9 5 16 12l-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="flex gap-8 mb-8 pb-7 border-b border-hairline flex-wrap">
          <div>
            <div className="text-xs font-semibold text-ink-faint mb-1">Entrou</div>
            <div className="font-display text-xl" style={{ color: "rgb(var(--brand))" }}>
              {formatCurrency(income)}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-faint mb-1">Saiu</div>
            <div className="font-display text-xl" style={{ color: "rgb(var(--wine))" }}>
              {formatCurrency(Math.abs(expense))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-ink-faint mb-1">Saldo do período</div>
            <div className="font-display text-xl">{formatCurrency(income + expense)}</div>
          </div>
        </div>

        {period === "ano" ? <YearView rows={rows} /> : <DayGroupedView rows={rows} categoryById={categoryById} />}
      </main>
    </div>
  );
}

function DayGroupedView({
  rows,
  categoryById,
}: {
  rows: Row[];
  categoryById: Map<string, { name: string; icon: string }>;
}) {
  const grouped = groupByDay(rows);

  if (grouped.length === 0) {
    return <p className="text-sm text-ink-faint">Nenhuma transação nesse período.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {grouped.map(([date, items]) => {
        const dayTotal = items.reduce((s, t) => s + t.amount, 0);
        return (
          <div key={date}>
            <div className="flex justify-between items-baseline mb-2.5">
              <span className="text-xs font-bold text-ink-faint uppercase tracking-wide">
                {formatDayLabel(date)}
              </span>
              <span className="text-xs font-semibold text-ink-faint">{formatCurrency(dayTotal)}</span>
            </div>
            <div className="rounded-card border border-hairline overflow-hidden">
              {items.map((t) => {
                const cat = t.category_id ? categoryById.get(t.category_id) : null;
                const positive = t.amount > 0;
                return (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-hairline last:border-none">
                    <span className="shrink-0">{cat?.icon ?? (positive ? "＋" : "－")}</span>
                    <span className="flex-1 text-sm truncate">{t.description}</span>
                    <span
                      className="font-display text-sm shrink-0"
                      style={{ color: positive ? "rgb(var(--brand))" : "rgb(var(--ink))" }}
                    >
                      {positive ? "+" : "−"} {formatCurrency(Math.abs(t.amount))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function YearView({ rows }: { rows: Row[] }) {
  const grouped = groupByMonth(rows);

  if (grouped.length === 0) {
    return <p className="text-sm text-ink-faint">Nenhuma transação nesse ano.</p>;
  }

  return (
    <div className="flex flex-col">
      {grouped.map(([monthKey, items]) => {
        const total = items.reduce((s, t) => s + t.amount, 0);
        return (
          <Link
            key={monthKey}
            href={`/dashboard/statement?period=mes&date=${monthKey}-01`}
            className="flex justify-between items-center py-3.5 border-b border-hairline last:border-none hover:opacity-80"
          >
            <span className="text-sm font-medium capitalize">{formatMonthKeyLabel(monthKey)}</span>
            <span className="font-display text-sm">{formatCurrency(total)}</span>
          </Link>
        );
      })}
    </div>
  );
}
