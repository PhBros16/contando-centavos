"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { RecurringRule, Account } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

const FREQUENCIES: { value: RecurringRule["frequency"]; label: string }[] = [
  { value: "semanal", label: "Semanal" },
  { value: "mensal", label: "Mensal" },
  { value: "anual", label: "Anual" },
];

export default function NewRecurringPage() {
  const router = useRouter();
  const supabase = createClient();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [existing, setExisting] = useState<RecurringRule[]>([]);
  const [kind, setKind] = useState<"receita" | "despesa">("despesa");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<RecurringRule["frequency"]>("mensal");
  const [nextOccurrence, setNextOccurrence] = useState("");
  const [accountId, setAccountId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    const [{ data: accs }, { data: rules }] = await Promise.all([
      supabase.from("accounts").select("*").eq("archived", false),
      supabase.from("recurring_rules").select("*").order("next_occurrence"),
    ]);
    setAccounts((accs ?? []) as Account[]);
    setExisting((rules ?? []) as RecurringRule[]);
    if (accs && accs.length > 0 && !accountId) setAccountId(accs[0].id);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const numericAmount = parseFloat(amount.replace(",", "."));
    const signedAmount = kind === "receita" ? Math.abs(numericAmount) : -Math.abs(numericAmount);

    const { error } = await supabase.from("recurring_rules").insert({
      household_id: profile!.household_id,
      account_id: accountId,
      description,
      amount: signedAmount,
      frequency,
      next_occurrence: nextOccurrence,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
    } else {
      setDescription("");
      setAmount("");
      setNextOccurrence("");
      loadData();
    }
  }

  async function toggleActive(rule: RecurringRule) {
    await supabase.from("recurring_rules").update({ active: !rule.active }).eq("id", rule.id);
    loadData();
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

        <h1 className="font-display text-2xl font-medium mb-1">Recorrências</h1>
        <p className="text-sm text-ink-soft mb-8">
          Salário, aluguel, assinaturas — o que se repete todo período. Isso alimenta a previsão
          de saldo dos próximos 30 dias.
        </p>

        {accounts.length === 0 ? (
          <p className="text-sm text-ink-faint mb-8">
            Cadastre uma conta primeiro em{" "}
            <Link href="/dashboard/accounts/new" className="text-brand font-semibold hover:underline">
              Contas
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-10">
            <div className="flex rounded-lg overflow-hidden border border-hairline w-fit">
              <button
                type="button"
                onClick={() => setKind("despesa")}
                className={`px-4 py-1.5 text-xs font-bold transition-colors ${
                  kind === "despesa" ? "bg-wine text-paper-raised" : "text-ink-soft"
                }`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setKind("receita")}
                className={`px-4 py-1.5 text-xs font-bold transition-colors ${
                  kind === "receita" ? "bg-brand text-paper-raised" : "text-ink-soft"
                }`}
              >
                Receita
              </button>
            </div>

            <input
              type="text"
              placeholder={kind === "receita" ? "ex: Salário" : "ex: Netflix"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />

            <div className="flex gap-3">
              <input
                type="text"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="flex-1 rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand transition-colors"
              />
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringRule["frequency"])}
                className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <input
                type="date"
                value={nextOccurrence}
                onChange={(e) => setNextOccurrence(e.target.value)}
                required
                className="flex-1 rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
              />
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="flex-1 rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-wine">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Adicionar recorrência"}
            </button>
          </form>
        )}

        {existing.length > 0 && (
          <div>
            <h3 className="text-[15.5px] font-bold mb-3">Já cadastradas</h3>
            <div>
              {existing.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 py-3 border-b border-hairline last:border-none"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{r.description}</div>
                    <div className="text-xs text-ink-faint mt-0.5">
                      {r.frequency} · próxima em{" "}
                      {new Date(r.next_occurrence + "T00:00:00").toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <span
                    className="font-display text-sm shrink-0"
                    style={{ color: r.amount > 0 ? "var(--brand)" : "var(--wine)" }}
                  >
                    {r.amount > 0 ? "+" : "−"} {formatCurrency(Math.abs(r.amount))}
                  </span>
                  <button
                    onClick={() => toggleActive(r)}
                    className="text-xs font-semibold text-ink-faint hover:text-ink shrink-0"
                  >
                    {r.active ? "Desativar" : "Ativar"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
