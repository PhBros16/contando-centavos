"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BANK_PRESETS, type BankPreset } from "@/lib/banks";
import { BankPicker } from "@/components/BankPicker";

const ACCOUNT_TYPES: { value: string; label: string }[] = [
  { value: "corrente", label: "Conta corrente" },
  { value: "poupanca", label: "Poupança" },
  { value: "cartao", label: "Cartão de crédito" },
  { value: "carteira", label: "Carteira física" },
  { value: "investimento", label: "Investimento" },
];

export default function NewAccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [bank, setBank] = useState<BankPreset>(BANK_PRESETS[0]);
  const [name, setName] = useState(BANK_PRESETS[0].name);
  const [type, setType] = useState("corrente");
  const [initialBalance, setInitialBalance] = useState("");
  const [closingDay, setClosingDay] = useState("5");
  const [dueDay, setDueDay] = useState("12");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelectBank(next: BankPreset) {
    setBank(next);
    // Só substitui o nome se ele ainda não foi customizado manualmente
    setName((current) => (BANK_PRESETS.some((b) => b.name === current) ? next.name : current));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user!.id)
      .single();

    const { error } = await supabase.from("accounts").insert({
      household_id: profile!.household_id,
      name,
      type,
      institution: bank.id === "outro" ? null : bank.name,
      color: bank.color,
      initial_balance: parseFloat(initialBalance.replace(",", ".")) || 0,
      closing_day: type === "cartao" ? parseInt(closingDay) || null : null,
      due_day: type === "cartao" ? parseInt(dueDay) || null : null,
    });

    setSaving(false);

    if (error) setError(error.message);
    else router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10 flex justify-center">
      <div className="w-full max-w-lg">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-8 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <h1 className="font-display text-2xl font-medium mb-1">Nova conta</h1>
        <p className="text-sm text-ink-soft mb-8">
          Escolha o banco pela cor, ou use "Outro" pra uma conta personalizada.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <span className="text-xs font-semibold text-ink-faint block mb-3">Banco / instituição</span>
            <BankPicker selectedId={bank.id} onSelect={handleSelectBank} />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-faint">Nome da conta</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-faint">Tipo</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-faint">Saldo inicial (opcional)</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="R$ 0,00"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand transition-colors"
            />
          </label>

          {type === "cartao" && (
            <div className="flex gap-3">
              <label className="flex-1 flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-faint">Dia de fechamento</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)}
                  className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
                />
              </label>
              <label className="flex-1 flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-faint">Dia de vencimento</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
                />
              </label>
            </div>
          )}

          {error && <p className="text-sm text-wine">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? "Criando…" : "Criar conta"}
          </button>
        </form>
      </div>
    </main>
  );
}
