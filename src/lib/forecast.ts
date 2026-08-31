import type { Budget, RecurringRule, Transaction } from "./types";

/**
 * Projeta o saldo dos próximos `days` dias a partir de:
 * 1) saldo atual
 * 2) recorrências ativas que vão ocorrer no período
 * 3) uma média diária de gastos "soltos" (não recorrentes) baseada no histórico
 *
 * Isso é intencionalmente simples (média móvel), não é machine learning —
 * mas já resolve 80% da utilidade de "quanto vou ter daqui a X dias".
 * Pode evoluir depois para regressão linear ou sazonalidade por categoria.
 */
export function projectBalance({
  currentBalance,
  recurringRules,
  historicalTransactions,
  days,
}: {
  currentBalance: number;
  recurringRules: RecurringRule[];
  historicalTransactions: Transaction[];
  days: number;
}): number {
  const recurringImpact = sumRecurringInPeriod(recurringRules, days);
  const dailyAverage = averageDailyDiscretionarySpend(historicalTransactions);
  const discretionaryImpact = dailyAverage * days;

  return currentBalance + recurringImpact + discretionaryImpact;
}

function sumRecurringInPeriod(rules: RecurringRule[], days: number): number {
  const occurrencesPerDay: Record<RecurringRule["frequency"], number> = {
    semanal: 1 / 7,
    mensal: 1 / 30,
    anual: 1 / 365,
  };

  return rules
    .filter((r) => r.active)
    .reduce((total, rule) => total + rule.amount * occurrencesPerDay[rule.frequency] * days, 0);
}

function averageDailyDiscretionarySpend(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;

  const dates = transactions.map((t) => new Date(t.occurred_at).getTime());
  const spanDays = Math.max(1, (Math.max(...dates) - Math.min(...dates)) / 86_400_000);
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return total / spanDays;
}

/**
 * Para cada orçamento do mês, projeta se ele vai estourar até o fim do mês,
 * com base no ritmo de gastos observado até hoje.
 */
export function projectBudgetOverrun(
  budget: Budget,
  daysElapsedInMonth: number,
  daysInMonth: number
): { willExceed: boolean; projectedTotal: number; projectedOverage: number } {
  const used = budget.used ?? 0;
  const dailyRate = daysElapsedInMonth > 0 ? used / daysElapsedInMonth : 0;
  const projectedTotal = dailyRate * daysInMonth;
  const projectedOverage = projectedTotal - budget.limit_amount;

  return {
    willExceed: projectedOverage > 0,
    projectedTotal,
    projectedOverage,
  };
}
