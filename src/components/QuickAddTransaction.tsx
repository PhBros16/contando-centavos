"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";
import { ReceiptAttach } from "@/components/ReceiptAttach";

export function QuickAddTransaction({
  accountId,
  householdId,
  topCategories,
}: {
  accountId: string | null;
  householdId: string;
  topCategories: Category[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [kind, setKind] = useState<"entrou" | "saiu">("saiu");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [showSplit, setShowSplit] = useState(false);
  const [splitCount, setSplitCount] = useState("2");
  const [saving, setSaving] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);
  const [lastReceiptPath, setLastReceiptPath] = useState<string | null>(null);

  function selectCategory(cat: Category) {
    if (categoryId === cat.id) {
      setCategoryId(null);
      return;
    }
    setCategoryId(cat.id);
    setKind(cat.kind === "receita" ? "entrou" : "saiu");
    if (!description) setDescription(cat.name);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId || !amount) return;

    setSaving(true);
    setLastCreatedId(null);

    const numericTotal = parseFloat(amount.replace(",", "."));
    const people = showSplit ? Math.max(parseInt(splitCount) || 1, 1) : 1;
    const yourShare = numericTotal / people;
    const signedAmount = kind === "entrou" ? Math.abs(yourShare) : -Math.abs(yourShare);

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        account_id: accountId,
        category_id: categoryId,
        description: description.trim() || (kind === "entrou" ? "Entrada rápida" : "Saída rápida"),
        amount: signedAmount,
        occurred_at: new Date().toISOString().slice(0, 10),
        split_total_amount: people > 1 ? numericTotal : null,
        split_count: people > 1 ? people : null,
      })
      .select()
      .single();

    setSaving(false);

    if (!error && data) {
      setAmount("");
      setDescription("");
      setCategoryId(null);
      setShowSplit(false);
      setLastCreatedId(data.id);
      setLastReceiptPath(null);
      router.refresh();
    }
  }

  return (
    <div className="rounded-card border border-hairline bg-paper-raised px-4 py-3.5">
      {topCategories.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-hairline -mx-0.5 px-0.5">
          {topCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(cat)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors"
              style={
                categoryId === cat.id
                  ? { background: cat.color, color: "#fff", borderColor: cat.color }
                  : { borderColor: "rgb(var(--hairline) / 0.3)" }
              }
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2.5">
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
          placeholder={showSplit ? "Valor total" : "R$ 0,00"}
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
          className="flex-1 min-w-[120px] rounded-lg border border-hairline bg-paper px-3 py-1.5 text-sm outline-none focus:border-brand transition-colors"
        />

        <button
          type="button"
          onClick={() => setShowSplit((v) => !v)}
          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg shrink-0 ${
            showSplit ? "bg-ink text-paper" : "text-ink-faint hover:text-ink"
          }`}
        >
          ÷ Dividir
        </button>

        {showSplit && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-ink-faint">entre</span>
            <input
              type="number"
              min={2}
              value={splitCount}
              onChange={(e) => setSplitCount(e.target.value)}
              className="w-14 rounded-lg border border-hairline bg-paper px-2 py-1.5 text-sm text-center outline-none focus:border-brand"
            />
            <span className="text-xs text-ink-faint">pessoas</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !accountId}
          className="px-4 py-1.5 rounded-lg bg-ink text-paper text-xs font-bold hover:opacity-85 transition-opacity disabled:opacity-50 shrink-0"
        >
          {saving ? "Salvando…" : "Lançar"}
        </button>
      </form>

      {showSplit && amount && (
        <p className="text-xs text-ink-faint mt-2">
          Sua parte: {(parseFloat(amount.replace(",", ".")) / Math.max(parseInt(splitCount) || 1, 1)).toLocaleString(
            "pt-BR",
            { style: "currency", currency: "BRL" }
          )}
        </p>
      )}

      {lastCreatedId && (
        <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-hairline">
          <span className="text-xs text-brand font-semibold">Lançado ✓</span>
          <ReceiptAttach
            transactionId={lastCreatedId}
            householdId={householdId}
            receiptPath={lastReceiptPath}
            onUploaded={setLastReceiptPath}
          />
        </div>
      )}
    </div>
  );
}
