"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  corrente: "Conta corrente",
  poupanca: "Poupança",
  cartao: "Cartão de crédito",
  carteira: "Carteira física",
  investimento: "Investimento",
};

export function AccountCard({ account, balance }: { account: Account; balance: number }) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(account.name);
  const [saving, setSaving] = useState(false);

  async function handleRename() {
    if (name.trim() && name !== account.name) {
      setSaving(true);
      await supabase.from("accounts").update({ name: name.trim() }).eq("id", account.id);
      setSaving(false);
      router.refresh();
    }
    setEditing(false);
  }

  async function handleArchive() {
    if (!confirm(`Arquivar "${account.name}"? Ela some das listas, mas o histórico é preservado.`)) return;
    await supabase.from("accounts").update({ archived: true }).eq("id", account.id);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3.5 rounded-card border border-hairline px-4 py-3.5">
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ background: account.color }}
      >
        {(account.institution ?? account.name).slice(0, 2).toUpperCase()}
      </span>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="text-sm font-semibold bg-transparent border-b border-brand outline-none w-full"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-sm font-semibold hover:underline text-left">
            {account.name}
          </button>
        )}
        <div className="text-xs text-ink-faint mt-0.5">{TYPE_LABELS[account.type] ?? account.type}</div>
      </div>

      <div className="font-display text-base font-medium shrink-0">{formatCurrency(balance)}</div>

      <button
        onClick={handleArchive}
        disabled={saving}
        className="text-xs font-semibold text-ink-faint hover:text-wine shrink-0"
      >
        Arquivar
      </button>
    </div>
  );
}
