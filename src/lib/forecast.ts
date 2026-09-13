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
  historicalWindowDays,
  days,
}: {
  currentBalance: number;
  recurringRules: RecurringRule[];
  historicalTransactions: Transaction[];
  historicalWindowDays: number;
  days: number;
}): number {
  const recurringImpact = sumRecurringInPeriod(recurringRules, days);
  const dailyAverage = averageDailyDiscretionarySpend(historicalTransactions, historicalWindowDays);
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

// Usa a janela de consulta (ex: os últimos N meses pedidos) como denominador,
// não o intervalo entre a primeira e a última transação encontrada. Com
// poucas transações (ou só uma, no mesmo dia) esse intervalo pode virar 1
// dia, fazendo o total daquele dia ser extrapolado como se se repetisse
// todo santo dia — gerando previsões absurdas com pouco histórico.
function averageDailyDiscretionarySpend(transactions: Transaction[], windowDays: number): number {
  if (transactions.length === 0) return 0;

  // Com menos de ~2 semanas de dados reais, a média ainda é pouco confiável
  // pra extrapolar — melhor não arriscar um número exagerado.
  if (windowDays < 14) return 0;

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  return total / windowDays;
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
