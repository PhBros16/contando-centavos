"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Account, Category, Transaction } from "@/lib/types";
import { formatCurrency, formatDateLabel } from "@/lib/format";
import { ReceiptAttach } from "@/components/ReceiptAttach";

export function EditableTransactionRow({
  transaction,
  categories,
  accounts,
}: {
  transaction: Transaction;
  categories: Category[];
  accounts: Account[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(Math.abs(transaction.amount).toString());
  const [isPositive, setIsPositive] = useState(transaction.amount > 0);
  const [occurredAt, setOccurredAt] = useState(transaction.occurred_at);
  const [categoryId, setCategoryId] = useState(transaction.category_id ?? "");
  const [accountId, setAccountId] = useState(transaction.account_id);

  async function handleSave() {
    setSaving(true);
    const numericAmount = parseFloat(amount.replace(",", "."));
    await supabase
      .from("transactions")
      .update({
        description,
        amount: isPositive ? Math.abs(numericAmount) : -Math.abs(numericAmount),
        occurred_at: occurredAt,
        category_id: categoryId || null,
        account_id: accountId,
      })
      .eq("id", transaction.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  // Não apaga na hora — dá uma janela de alguns segundos pra desfazer,
  // evitando aquele "ops, apaguei sem querer" de um clique acidental.
  function handleDeleteClick() {
    setPendingDelete(true);
    deleteTimeoutRef.current = setTimeout(async () => {
      await supabase.from("transactions").delete().eq("id", transaction.id);
      router.refresh();
    }, 5000);
  }

  function handleUndo() {
    if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    setPendingDelete(false);
  }

  if (pendingDelete) {
    return (
      <div
        className="flex items-center justify-between gap-3 py-2.5 px-3 my-1 rounded-lg border-b border-hairline last:border-none"
        style={{ background: "rgb(var(--wine) / 0.06)" }}
      >
        <span className="text-sm text-ink-soft">Transação excluída</span>
        <button onClick={handleUndo} className="text-xs font-bold text-brand hover:underline">
          Desfazer
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 py-3 border-b border-hairline">
        <div className="flex rounded-lg overflow-hidden border border-hairline shrink-0">
          <button
            type="button"
            onClick={() => setIsPositive(true)}
            className={`px-2.5 py-1.5 text-xs font-bold ${isPositive ? "bg-brand text-paper-raised" : "text-ink-soft"}`}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setIsPositive(false)}
            className={`px-2.5 py-1.5 text-xs font-bold ${!isPositive ? "bg-wine text-paper-raised" : "text-ink-soft"}`}
          >
            −
          </button>
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 min-w-[120px] rounded-lg border border-hairline bg-paper-raised px-2.5 py-1.5 text-sm outline-none focus:border-brand"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          className="w-24 rounded-lg border border-hairline bg-paper-raised px-2.5 py-1.5 text-sm font-display outline-none focus:border-brand"
        />
        <input
          type="date"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          className="rounded-lg border border-hairline bg-paper-raised px-2.5 py-1.5 text-sm outline-none focus:border-brand"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-hairline bg-paper-raised px-2.5 py-1.5 text-sm outline-none focus:border-brand"
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="rounded-lg border border-hairline bg-paper-raised px-2.5 py-1.5 text-sm outline-none focus:border-brand"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 rounded-lg bg-ink text-paper text-xs font-bold"
        >
          {saving ? "…" : "Salvar"}
        </button>
        <button onClick={() => setEditing(false)} className="text-xs text-ink-faint hover:text-ink">
          Cancelar
        </button>
      </div>
    );
  }

  const positive = transaction.amount > 0;

  return (
    <div className="group flex items-center gap-3.5 py-3 border-b border-hairline last:border-none">
      <div
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs"
        style={{ background: positive ? "rgb(var(--brand) / 0.1)" : "rgb(var(--wine) / 0.1)" }}
      >
        {transaction.category?.icon ?? (positive ? "＋" : "－")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate flex items-center gap-1.5">
          {transaction.description}
          {transaction.installment_total && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-hairline/15 text-ink-soft shrink-0">
              {transaction.installment_number}/{transaction.installment_total}
            </span>
          )}
          {transaction.split_count && transaction.split_count > 1 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-hairline/15 text-ink-soft shrink-0">
              ÷{transaction.split_count}
            </span>
          )}
        </div>
        <div className="text-xs text-ink-faint mt-0.5 truncate">
          {transaction.category?.name ?? "Sem categoria"} · {formatDateLabel(transaction.occurred_at)}
          {transaction.recurring_rule_id && " · ↻"}
        </div>
      </div>
      <div
        className="font-display text-[15px] font-medium shrink-0"
        style={{ color: positive ? "rgb(var(--brand))" : "rgb(var(--ink))" }}
      >
        {positive ? "+" : "−"} {formatCurrency(Math.abs(transaction.amount))}
      </div>
      <ReceiptAttach
        transactionId={transaction.id}
        householdId={transaction.household_id}
        receiptPath={transaction.receipt_path}
      />
      <div className="flex gap-2.5 shrink-0">
        <button onClick={() => setEditing(true)} className="text-xs font-semibold text-brand hover:underline">
          Editar
        </button>
        <button onClick={handleDeleteClick} className="text-xs font-semibold text-wine hover:underline">
          Excluir
        </button>
      </div>
    </div>
  );
}
