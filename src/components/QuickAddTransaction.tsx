"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function QuickAddTransaction({ accountId }: { accountId: string | null }) {
  const router = useRouter();
  const supabase = createClient();

  const [kind, setKind] = useState<"entrou" | "saiu">("saiu");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId || !amount) return;

    setSaving(true);
    const numericAmount = parseFloat(amount.replace(",", "."));
    const signedAmount = kind === "entrou" ? Math.abs(numericAmount) : -Math.abs(numericAmount);

    const { error } = await supabase.from("transactions").insert({
      account_id: accountId,
      description: description.trim() || (kind === "entrou" ? "Entrada rápida" : "Saída rápida"),
      amount: signedAmount,
      occurred_at: new Date().toISOString().slice(0, 10),
    });

    setSaving(false);

    if (!error) {
      setAmount("");
      setDescription("");
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1800);
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2.5 rounded-card border border-hairline bg-paper-raised px-4 py-3.5"
    >
      <div className="flex rounded-lg overflow-hidden border border-hairline shrink-0">
        <button
          type="button"
          onClick={() => setKind("entrou")}
          className={`px-3 py-1.5 text-xs font-bold transition-colors ${
            kind === "entrou" ? "bg-brand text-paper-raised" : "text-ink-soft"
          }`}
        >
          Entrou
        </button>
        <button
          type="button"
          onClick={() => setKind("saiu")}
          className={`px-3 py-1.5 text-xs font-bold transition-colors ${
            kind === "saiu" ? "bg-wine text-paper-raised" : "text-ink-soft"
          }`}
        >
          Saiu
        </button>
      </div>

      <input
        type="text"
        inputMode="decimal"
        placeholder="R$ 0,00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-28 rounded-lg border border-hairline bg-paper px-3 py-1.5 text-sm font-display outline-none focus:border-brand transition-colors"
        required
      />

      <input
        type="text"
        placeholder="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="flex-1 min-w-[140px] rounded-lg border border-hairline bg-paper px-3 py-1.5 text-sm outline-none focus:border-brand transition-colors"
      />

      <button
        type="submit"
        disabled={saving || !accountId}
        className="px-4 py-1.5 rounded-lg bg-ink text-paper text-xs font-bold hover:opacity-85 transition-opacity disabled:opacity-50 shrink-0"
      >
        {justSaved ? "Lançado ✓" : saving ? "Salvando…" : "Lançar"}
      </button>
    </form>
  );
}
