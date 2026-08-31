import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Hero } from "@/components/Hero";
import { CashFlowChart } from "@/components/CashFlowChart";
import { TransactionList } from "@/components/TransactionList";
import { BudgetList } from "@/components/BudgetList";
import { GoalList } from "@/components/GoalList";
import { ForecastCard } from "@/components/ForecastCard";
import { projectBalance, projectBudgetOverrun } from "@/lib/forecast";
import { formatMonthLabel } from "@/lib/format";
import type { Transaction, Budget, Goal, RecurringRule, MonthlyFlowPoint } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const [
    { data: accounts },
    { data: transactions },
    { data: budgets },
    { data: goals },
    { data: recurringRules },
  ] = await Promise.all([
    supabase.from("accounts").select("*").eq("archived", false),
    supabase
      .from("transactions")
      .select("*, category:categories(name, color, icon)")
      .order("occurred_at", { ascending: false })
      .limit(5),
    supabase.from("budgets").select("*, category:categories(name)"),
    supabase.from("goals").select("*"),
    supabase.from("recurring_rules").select("*").eq("active", true),
  ]);

  const currentBalance = (accounts ?? []).reduce((sum, a) => sum + Number(a.initial_balance), 0);

  const now = new Date();
  const monthlyFlow = buildMonthlyFlow(now);

  const income = (transactions ?? []).filter((t) => t.amount > 0).reduce((s, t) => s + Number(t.amount), 0);
  const expense = (transactions ?? []).filter((t) => t.amount < 0).reduce((s, t) => s + Number(t.amount), 0);

  const projectedBalance = projectBalance({
    currentBalance,
    recurringRules: (recurringRules ?? []) as RecurringRule[],
    historicalTransactions: (transactions ?? []) as Transaction[],
    days: 30,
  });

  const budgetsWithUsage: Budget[] = (budgets ?? []).map((b) => ({
    ...b,
    used: Math.abs(
      (transactions ?? [])
        .filter((t) => t.category_id === b.category_id && t.amount < 0)
        .reduce((s, t) => s + Number(t.amount), 0)
    ),
  }));

  const overBudget = budgetsWithUsage.find(
    (b) => projectBudgetOverrun(b, now.getDate(), daysInMonth(now)).willExceed
  );
  const alertMessage = overBudget
    ? `Atenção: o gasto com ${overBudget.category?.name} tende a superar o orçado se o ritmo atual continuar.`
    : undefined;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14">
        <div className="flex justify-between items-start mb-1.5">
          <div>
            <div className="text-[13.5px] text-ink-faint mb-1">
              {now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </div>
            <h1 className="font-display text-2xl font-medium">Visão geral da família</h1>
          </div>
          <ThemeToggle />
        </div>

        <Hero
          balance={currentBalance}
          deltaPct={3.2}
          income={income}
          expense={Math.abs(expense)}
          sparklinePoints="M2,30 C 20,26 30,32 46,24 C 62,16 70,22 88,18 C 106,14 116,10 132,12 C 150,14 160,6 176,8 C 194,10 204,4 218,4"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-10 mt-8">
          <div className="flex flex-col gap-10">
            <CashFlowChart data={monthlyFlow} />
            <TransactionList transactions={(transactions ?? []) as Transaction[]} />
          </div>

          <div className="flex flex-col gap-10">
            <BudgetList budgets={budgetsWithUsage} />
            <GoalList goals={(goals ?? []) as Goal[]} />
            <ForecastCard projectedBalance={projectedBalance} alertMessage={alertMessage} />
          </div>
        </div>
      </main>
    </div>
  );
}

function buildMonthlyFlow(reference: Date): MonthlyFlowPoint[] {
  // Placeholder até existir histórico suficiente — troque por uma consulta
  // agregando transactions por mês assim que houver dados reais.
  const points: MonthlyFlowPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
    points.push({ month: formatMonthLabel(d), net: 0 });
  }
  return points;
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
