"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Bill } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function BillsList({ bills }: { bills: Bill[] }) {
  const router = useRouter();
  const supabase = createClient();

  async function markAsPaid(id: string) {
    await supabase.from("bills").update({ status: "pago" }).eq("id", id);
    router.refresh();
  }

  const sorted = [...bills].sort((a, b) => a.due_date.localeCompare(b.due_date));

  return (
    <div>
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="text-[15.5px] font-bold">Despesas e compromissos</h3>
        <span className="text-xs text-ink-faint">{bills.filter((b) => b.status !== "pago").length} pendentes</span>
      </div>
      {sorted.length === 0 && (
        <p className="text-sm text-ink-faint">Nenhuma despesa cadastrada ainda.</p>
      )}
      <div>
        {sorted.map((bill) => {
          const isPaid = bill.status === "pago";
          const isLate = !isPaid && new Date(bill.due_date) < new Date(new Date().toDateString());
          const statusColor = isPaid ? "var(--brand)" : isLate ? "var(--wine)" : "var(--gold)";
          const statusLabel = isPaid ? "Pago" : isLate ? "Atrasado" : "Pendente";

          return (
            <div
              key={bill.id}
              className="flex items-center gap-3.5 py-3.5 border-b border-hairline last:border-none"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{bill.description}</div>
                <div className="text-xs text-ink-faint mt-0.5">
                  Vence em {new Date(bill.due_date + "T00:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
              </div>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{ color: statusColor, background: `${statusColor}1a` }}
              >
                {statusLabel}
              </span>
              <div className="font-display text-[15px] font-medium shrink-0">
                {formatCurrency(bill.amount)}
              </div>
              {!isPaid && (
                <button
                  onClick={() => markAsPaid(bill.id)}
                  className="text-xs font-semibold text-brand hover:underline shrink-0"
                >
                  Marcar pago
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
