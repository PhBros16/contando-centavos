import type { Transaction } from "@/lib/types";
import { formatCurrency, formatDateLabel } from "@/lib/format";

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="text-[15.5px] font-bold">Transações recentes</h3>
        <span className="text-xs text-ink-faint">{transactions.length} últimas</span>
      </div>
      <div>
        {transactions.map((tx) => {
          const positive = tx.amount > 0;
          return (
            <div key={tx.id} className="flex items-center gap-3.5 py-3.5 border-b border-hairline last:border-none">
              <div
                className="w-[34px] h-[34px] rounded-[9px] shrink-0 flex items-center justify-center"
                style={{
                  background: positive ? "rgb(var(--brand) / 0.1)" : "rgb(var(--wine) / 0.1)",
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: positive ? "rgb(var(--brand))" : "rgb(var(--wine))" }}
                >
                  {tx.description.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{tx.description}</div>
                <div className="text-xs text-ink-faint mt-0.5 truncate">
                  {tx.category?.name ?? "Sem categoria"} · {formatDateLabel(tx.occurred_at)}
                </div>
              </div>
              <div
                className="font-display text-[15px] font-medium whitespace-nowrap"
                style={{ color: positive ? "rgb(var(--brand))" : "rgb(var(--ink))" }}
              >
                {positive ? "+" : "−"} {formatCurrency(Math.abs(tx.amount))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
