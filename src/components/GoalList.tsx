import type { Goal } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function GoalList({ goals }: { goals: Goal[] }) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-[15.5px] font-bold">Metas</h3>
      </div>
      <div>
        {goals.map((g) => {
          const pct = Math.round((g.current_amount / g.target_amount) * 100);
          return (
            <div key={g.id} className="mb-5 last:mb-0">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[13.5px] font-semibold">{g.name}</span>
                <span className="font-display text-[15px]" style={{ color: "rgb(var(--gold))" }}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-hairline/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(pct, 100)}%`, background: "rgb(var(--gold))" }}
                />
              </div>
              <div className="text-xs text-ink-faint mt-1.5">
                {formatCurrency(g.current_amount)} de {formatCurrency(g.target_amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
