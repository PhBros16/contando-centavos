"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Bill } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function BillsList({
  bills,
  householdId,
  defaultAccountId,
}: {
  bills: Bill[];
  householdId?: string;
  defaultAccountId?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  async function markAsPaid(bill: Bill) {
    setBusyId(bill.id);
    setErrorId(null);

    // Marcar como pago também lança a saída correspondente na conta —
    // antes eram dois sistemas desconectados: o status mudava mas o
    // dinheiro nunca saía de lugar nenhum, e o "atrasado" não sumia se a
    // pessoa lançasse a transação por conta própria em vez de usar este
    // botão.
    if (householdId && defaultAccountId) {
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          household_id: householdId,
          account_id: defaultAccountId,
          category_id: bill.category_id,
          description: `Pagamento: ${bill.description}`,
          amount: -Math.abs(bill.amount),
          occurred_at: new Date().toISOString().slice(0, 10),
        })
        .select()
        .single();

      if (txError || !transaction) {
        setBusyId(null);
        setErrorId(bill.id);
        return;
      }

      await supabase
        .from("bills")
        .update({ status: "pago", transaction_id: transaction.id })
        .eq("id", bill.id);
    } else {
      // Sem conta cadastrada ainda não dá pra lançar a saída — só atualiza o status.
      await supabase.from("bills").update({ status: "pago" }).eq("id", bill.id);
    }

    setBusyId(null);
    router.refresh();
  }

  const sorted = [...bills].sort((a, b) => a.due_date.localeCompare(b.due_date));

  return (
    <div>
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="text-[15.5px] font-bold">Contas a pagar</h3>
        <span className="text-xs text-ink-faint">{bills.filter((b) => b.status !== "pago").length} pendentes</span>
      </div>
      {sorted.length === 0 && (
        <Link
          href="/dashboard/bills/new"
          className="flex items-center justify-between gap-3 rounded-card border border-dashed border-hairline px-4 py-3.5 text-sm text-ink-soft hover:text-ink transition-colors"
        >
          Nenhuma despesa cadastrada ainda.
        </Link>
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
                  {errorId === bill.id && (
                    <span className="text-wine"> · não deu pra marcar, tenta de novo</span>
                  )}
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
                  onClick={() => markAsPaid(bill)}
                  disabled={busyId === bill.id}
                  className="text-xs font-semibold text-brand hover:underline shrink-0 disabled:opacity-50"
                >
                  {busyId === bill.id ? "Marcando…" : "Marcar pago"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
