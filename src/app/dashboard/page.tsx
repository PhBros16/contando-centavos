import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import { LogoutButton } from "@/components/LogoutButton";
import { Hero } from "@/components/Hero";
import { QuickAddTransaction } from "@/components/QuickAddTransaction";
import { CashFlowChart } from "@/components/CashFlowChart";
import { TransactionList } from "@/components/TransactionList";
import { BudgetList } from "@/components/BudgetList";
import { GoalList } from "@/components/GoalList";
import { BillsList } from "@/components/BillsList";
import { ForecastCard } from "@/components/ForecastCard";
import { projectBalance, projectBudgetOverrun } from "@/lib/forecast";
import { processDueRecurringRules } from "@/lib/processRecurring";
import { formatMonthLabel } from "@/lib/format";
import type { Transaction, Budget, Goal, RecurringRule, MonthlyFlowPoint, Bill, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Antes de mostrar qualquer número, gera as transações de recorrências
  // que já venceram (salário, assinaturas etc.)
  await processDueRecurringRules(supabase);

  const now = new Date();
  const firstOfMonthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const sixMonthsAgoStr = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10);

  const [
    { data: profile },
    { data: accounts },
    { data: recentTransactions },
    { data: last6MonthsTransactions },
    { data: allTimeAmounts },
    { data: budgets },
    { data: goals },
    { data: recurringRules },
    { data: bills },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("accounts").select("*").eq("archived", false),
    supabase
      .from("transactions")
      .select("*, category:categories(name, color, icon)")
      .order("occurred_at", { ascending: false })
      .limit(5),
    // Cobre tanto o gráfico de 6 meses quanto o total do mês atual
    supabase.from("transactions").select("amount, occurred_at, category_id").gte("occurred_at", sixMonthsAgoStr),
    // Saldo real = saldo inicial + TODAS as transações já lançadas (não só as recentes)
    supabase.from("transactions").select("amount"),
    supabase.from("budgets").select("*, category:categories(name)"),
    supabase.from("goals").select("*"),
    supabase.from("recurring_rules").select("*").eq("active", true),
    supabase.from("bills").select("*, category:categories(name)").order("due_date"),
  ]);

  const initialBalanceSum = (accounts ?? []).reduce((sum, a) => sum + Number(a.initial_balance), 0);
  const transactionsDelta = (allTimeAmounts ?? []).reduce((sum, t) => sum + Number(t.amount), 0);
  const currentBalance = initialBalanceSum + transactionsDelta;

  const monthlyFlow = buildMonthlyFlow(now, last6MonthsTransactions ?? []);

  const currentMonthTx = (last6MonthsTransactions ?? []).filter((t) => t.occurred_at >= firstOfMonthStr);
  const income = currentMonthTx.filter((t) => t.amount > 0).reduce((s, t) => s + Number(t.amount), 0);
  const expense = currentMonthTx.filter((t) => t.amount < 0).reduce((s, t) => s + Number(t.amount), 0);

  const projectedBalance = projectBalance({
    currentBalance,
    recurringRules: (recurringRules ?? []) as RecurringRule[],
    historicalTransactions: (last6MonthsTransactions ?? []) as Transaction[],
    days: 30,
  });

  const budgetsWithUsage: Budget[] = (budgets ?? []).map((b) => ({
    ...b,
    used: Math.abs(
      currentMonthTx
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

  const thisMonthNet = income + expense; // expense já é negativo
  const balanceAtStartOfMonth = currentBalance - thisMonthNet;
  const deltaPct =
    balanceAtStartOfMonth !== 0 ? (thisMonthNet / Math.abs(balanceAtStartOfMonth)) * 100 : 0;

  const transactions = recentTransactions;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14">
        <div className="flex justify-between items-start mb-1.5">
          <div>
            <div className="text-[13.5px] text-ink-faint mb-1">
              {now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </div>
            <h1 className="font-display text-2xl font-medium">
              Olá, {(profile as Profile | null)?.full_name?.split(" ")[0] ?? "por aqui"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LogoutButton />
            {profile && (
              <UserAvatar
                profileId={(profile as Profile).id}
                fullName={(profile as Profile).full_name}
                avatarUrl={(profile as Profile).avatar_url}
                avatarColor={(profile as Profile).avatar_color}
              />
            )}
          </div>
        </div>

        <Hero
          balance={currentBalance}
          deltaPct={deltaPct}
          income={income}
          expense={Math.abs(expense)}
          sparklinePoints="M2,30 C 20,26 30,32 46,24 C 62,16 70,22 88,18 C 106,14 116,10 132,12 C 150,14 160,6 176,8 C 194,10 204,4 218,4"
        />

        <div className="mt-6">
          {accounts && accounts.length > 0 ? (
            <QuickAddTransaction accountId={accounts[0].id} />
          ) : (
            <Link
              href="/dashboard/accounts/new"
              className="flex items-center justify-between gap-3 rounded-card border border-dashed border-hairline bg-paper-raised px-4 py-3.5 text-sm text-ink-soft hover:text-ink transition-colors"
            >
              <span>Cadastre sua primeira conta pra começar a lançar valores.</span>
              <span className="font-semibold text-brand shrink-0">Criar conta →</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-10 mt-8">
          <div className="flex flex-col gap-10">
            <CashFlowChart data={monthlyFlow} />
            <TransactionList transactions={(transactions ?? []) as Transaction[]} />
          </div>

          <div className="flex flex-col gap-10">
            <BillsList bills={(bills ?? []) as Bill[]} />
            <BudgetList budgets={budgetsWithUsage} />
            <GoalList goals={(goals ?? []) as Goal[]} />
            <ForecastCard projectedBalance={projectedBalance} alertMessage={alertMessage} />
          </div>
        </div>
      </main>
    </div>
  );
}

function buildMonthlyFlow(
  reference: Date,
  transactions: { amount: number; occurred_at: string }[]
): MonthlyFlowPoint[] {
  const points: MonthlyFlowPoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
    const monthEnd = new Date(reference.getFullYear(), reference.getMonth() - i + 1, 1);
    const monthStartStr = monthStart.toISOString().slice(0, 10);
    const monthEndStr = monthEnd.toISOString().slice(0, 10);

    const net = transactions
      .filter((t) => t.occurred_at >= monthStartStr && t.occurred_at < monthEndStr)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    points.push({ month: formatMonthLabel(monthStart), net });
  }

  return points;
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
