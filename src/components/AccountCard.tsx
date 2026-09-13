"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [initialBalance, setInitialBalance] = useState(String(account.initial_balance));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("accounts")
      .update({
        name: name.trim() || account.name,
        initial_balance: parseFloat(initialBalance.replace(",", ".")) || 0,
      })
      .eq("id", account.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleArchive() {
    if (!confirm(`Arquivar "${account.name}"? Ela some das listas, mas o histórico é preservado.`)) return;
    await supabase.from("accounts").update({ archived: true }).eq("id", account.id);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-brand px-4 py-3.5">
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: account.color }}
        >
          {(account.institution ?? account.name).slice(0, 2).toUpperCase()}
        </span>
        <label className="flex flex-col gap-1 flex-1 min-w-[120px]">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Nome</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-sm rounded-lg border border-hairline bg-paper-raised px-2.5 py-1.5 outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 w-32">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Saldo inicial</span>
          <input
            inputMode="decimal"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            className="text-sm rounded-lg border border-hairline bg-paper-raised px-2.5 py-1.5 outline-none focus:border-brand"
          />
        </label>
        <div className="flex gap-2.5 ml-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-ink text-paper disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
          <button onClick={() => setEditing(false)} className="text-xs text-ink-faint hover:text-ink">
            Cancelar
          </button>
        </div>
      </div>
    );
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
        <div className="text-sm font-semibold truncate">{account.name}</div>
        <div className="text-xs text-ink-faint mt-0.5">{TYPE_LABELS[account.type] ?? account.type}</div>
      </div>

      <div className="font-display text-base font-medium shrink-0">{formatCurrency(balance)}</div>

      {account.type === "cartao" && account.closing_day && (
        <Link
          href={`/dashboard/accounts/${account.id}/invoice`}
          className="text-xs font-semibold text-brand hover:underline shrink-0"
        >
          Fatura
        </Link>
      )}

      <button
        onClick={() => setEditing(true)}
        className="text-xs font-semibold text-brand hover:underline shrink-0"
      >
        Editar
      </button>

      <button
        onClick={handleArchive}
        className="text-xs font-semibold text-ink-faint hover:text-wine shrink-0"
      >
        Arquivar
      </button>
    </div>
  );
}
