import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { SimulatorForm } from "@/components/SimulatorForm";
import { projectBalance } from "@/lib/forecast";
import type { Category, RecurringRule, Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SimulatorPage() {
  const supabase = createClient();

  const sixMonthsAgoStr = new Date(new Date().setMonth(new Date().getMonth() - 5))
    .toISOString()
    .slice(0, 10);

  const [{ data: accounts }, { data: transactions }, { data: recurringRules }, { data: categories }] =
    await Promise.all([
      supabase.from("accounts").select("initial_balance").eq("archived", false),
      supabase
        .from("transactions")
        .select("amount, occurred_at, category_id")
        .gte("occurred_at", sixMonthsAgoStr),
      supabase.from("recurring_rules").select("*").eq("active", true),
      supabase.from("categories").select("*").eq("kind", "despesa").order("name"),
    ]);

  const { data: allAmounts } = await supabase.from("transactions").select("amount");
  const currentBalance =
    (accounts ?? []).reduce((s, a) => s + Number(a.initial_balance), 0) +
    (allAmounts ?? []).reduce((s, t) => s + Number(t.amount), 0);

  const baselineForecast = projectBalance({
    currentBalance,
    recurringRules: (recurringRules ?? []) as RecurringRule[],
    historicalTransactions: (transactions ?? []) as Transaction[],
    days: 30,
  });

  // Gasto médio mensal por categoria, com base nos últimos 6 meses
  const categorySpend = Object.fromEntries(
    (categories ?? []).map((c) => {
      const total = (transactions ?? [])
        .filter((t) => t.category_id === c.id && t.amount < 0)
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
      return [c.id, total / 6];
    })
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-6 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <h1 className="font-display text-2xl font-medium mb-1">Simulador "e se"</h1>
        <p className="text-sm text-ink-soft mb-8">
          Veja o impacto de cortar uma parte do gasto de uma categoria na sua previsão de 30 dias.
        </p>

        <SimulatorForm
          categories={(categories ?? []) as Category[]}
          categorySpend={categorySpend}
          baselineForecast={baselineForecast}
        />
      </main>
    </div>
  );
}
