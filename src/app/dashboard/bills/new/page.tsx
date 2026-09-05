"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

export default function NewBillPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .eq("kind", "despesa")
      .order("name")
      .then(({ data }) => setCategories((data ?? []) as Category[]));
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

    const { error } = await supabase.from("bills").insert({
      household_id: profile!.household_id,
      category_id: categoryId || null,
      description,
      amount: Math.abs(parseFloat(amount.replace(",", ".")) || 0),
      due_date: dueDate,
      recurring,
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

        <h1 className="font-display text-2xl font-medium mb-1">Nova despesa</h1>
        <p className="text-sm text-ink-soft mb-8">
          Para contas com vencimento — fatura de cartão, boleto, assinatura pendente.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-faint">Descrição</span>
            <input
              type="text"
              placeholder="ex: Fatura do cartão"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </label>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex-1 flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-faint">Valor</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand transition-colors"
              />
            </label>
            <label className="flex-1 flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-faint">Vencimento</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-faint">Categoria (opcional)</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="w-4 h-4 accent-brand"
            />
            Essa despesa se repete todo mês
          </label>

          {error && <p className="text-sm text-wine">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Adicionar despesa"}
          </button>
        </form>
      </div>
    </main>
  );
}
