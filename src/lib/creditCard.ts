/**
 * Calcula o ciclo de fatura atual de um cartão a partir do dia de fechamento.
 * Assume que o vencimento cai no mês seguinte ao fechamento (padrão mais comum
 * no Brasil) — simplificação intencional, documentada aqui.
 */
export function currentBillingCycle(
  closingDay: number,
  dueDay: number,
  reference: Date = new Date()
): { start: string; end: string; dueDate: string } {
  const today = reference.getDate();

  // Se ainda não passou do fechamento deste mês, o ciclo atual fechou no mês
  // passado; senão, fecha neste mês.
  const cycleEndMonth = today <= closingDay ? reference.getMonth() : reference.getMonth() + 1;
  const cycleEnd = new Date(reference.getFullYear(), cycleEndMonth, closingDay);
  const cycleStart = new Date(reference.getFullYear(), cycleEndMonth - 1, closingDay + 1);
  const dueDate = new Date(reference.getFullYear(), cycleEndMonth + 1, dueDay);

  return {
    start: cycleStart.toISOString().slice(0, 10),
    end: cycleEnd.toISOString().slice(0, 10),
    dueDate: dueDate.toISOString().slice(0, 10),
  };
}
