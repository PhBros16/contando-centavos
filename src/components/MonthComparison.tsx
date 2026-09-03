import type { CategorySpend } from "@/lib/monthComparison";
import { formatCurrency } from "@/lib/format";

export function MonthComparison({ rows }: { rows: CategorySpend[] }) {
  const withChange = rows.filter((r) => r.previous > 0 || r.current > 0).slice(0, 5);

  if (withChange.length === 0) return null;

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-[15.5px] font-bold">Comparado ao mês passado</h3>
      </div>
      <div className="flex flex-col gap-3">
        {withChange.map((row) => {
          const pctChange = row.previous > 0 ? ((row.current - row.previous) / row.previous) * 100 : null;
          const isIncrease = row.current > row.previous;

          return (
            <div key={row.categoryId ?? "sem_categoria"} className="flex justify-between items-baseline gap-3">
              <span className="text-sm font-medium truncate">{row.categoryName}</span>
              <span className="text-xs text-ink-faint shrink-0 text-right">
                {formatCurrency(row.current)}
                {pctChange !== null && (
                  <span
                    className="ml-1.5 font-semibold"
                    style={{ color: isIncrease ? "rgb(var(--wine))" : "rgb(var(--brand))" }}
                  >
                    {isIncrease ? "+" : ""}
                    {pctChange.toFixed(0)}%
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
