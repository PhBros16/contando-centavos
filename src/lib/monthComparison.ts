export type CategorySpend = { categoryId: string | null; categoryName: string; current: number; previous: number };

/**
 * Compara o gasto por categoria do mês atual com o mês anterior.
 * Retorna ordenado pela maior alta em R$ primeiro — o que mais "pesou" no bolso.
 */
export function compareMonthlySpend(
  transactions: { amount: number; occurred_at: string; category_id: string | null }[],
  categoryNames: Record<string, string>,
  reference: Date = new Date()
): CategorySpend[] {
  const firstOfThisMonth = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const firstOfLastMonth = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
  const firstOfThisMonthStr = firstOfThisMonth.toISOString().slice(0, 10);
  const firstOfLastMonthStr = firstOfLastMonth.toISOString().slice(0, 10);

  const currentByCategory: Record<string, number> = {};
  const previousByCategory: Record<string, number> = {};

  for (const t of transactions) {
    if (t.amount >= 0) continue; // só despesas
    const key = t.category_id ?? "sem_categoria";
    const value = Math.abs(t.amount);

    if (t.occurred_at >= firstOfThisMonthStr) {
      currentByCategory[key] = (currentByCategory[key] ?? 0) + value;
    } else if (t.occurred_at >= firstOfLastMonthStr && t.occurred_at < firstOfThisMonthStr) {
      previousByCategory[key] = (previousByCategory[key] ?? 0) + value;
    }
  }

  const allKeys = new Set([...Object.keys(currentByCategory), ...Object.keys(previousByCategory)]);

  const rows: CategorySpend[] = Array.from(allKeys).map((key) => ({
    categoryId: key === "sem_categoria" ? null : key,
    categoryName: key === "sem_categoria" ? "Sem categoria" : categoryNames[key] ?? "Categoria",
    current: currentByCategory[key] ?? 0,
    previous: previousByCategory[key] ?? 0,
  }));

  return rows.sort((a, b) => b.current - b.previous - (a.current - a.previous));
}
