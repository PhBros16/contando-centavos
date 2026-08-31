import type { Budget } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function BudgetList({ budgets }: { budgets: Budget[] }) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-[15.5px] font-bold">Orçamento do mês</h3>
      </div>
      <div>
        {budgets.map((b) => {
          const used = b.used ?? 0;
          const ratio = used / b.limit_amount;
          const pct = Math.min(ratio * 100, 100);
          const barColor = ratio >= 1 ? "rgb(var(--wine))" : ratio >= 0.85 ? "rgb(var(--gold))" : "rgb(var(--brand))";

          return (
            <div key={b.id} className="mb-[18px] last:mb-0">
              <div className="flex justify-between text-[13.5px] mb-1.5">
                <span className="font-semibold">{b.category?.name ?? "Categoria"}</span>
                <span className="text-ink-faint">
                  {formatCurrency(used)} de {formatCurrency(b.limit_amount)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-hairline/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
