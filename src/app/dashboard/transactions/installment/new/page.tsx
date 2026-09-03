"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Account, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export default function NewInstallmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [installments, setInstallments] = useState("2");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [firstDate, setFirstDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("accounts").select("*").eq("archived", false),
      supabase.from("categories").select("*").eq("kind", "despesa").order("name"),
    ]).then(([accRes, catRes]) => {
      setAccounts((accRes.data ?? []) as Account[]);
      setCategories((catRes.data ?? []) as Category[]);
      if (accRes.data && accRes.data.length > 0) setAccountId(accRes.data[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = parseFloat(totalAmount.replace(",", ".")) || 0;
  const n = Math.max(parseInt(installments) || 1, 1);
  const perInstallment = total / n;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user!.id)
      .single();

    const groupId = crypto.randomUUID();
    const baseDate = new Date(firstDate + "T00:00:00");

    // Arredondamento: a primeira parcela absorve a diferença de centavos
    const roundedShare = Math.round(perInstallment * 100) / 100;
    const firstShare = Math.round((total - roundedShare * (n - 1)) * 100) / 100;

    const rows = Array.from({ length: n }, (_, i) => {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());
      return {
        household_id: profile!.household_id,
        account_id: accountId,
        category_id: categoryId || null,
        description,
        amount: -(i === 0 ? firstShare : roundedShare),
        occurred_at: date.toISOString().slice(0, 10),
        installment_group_id: groupId,
        installment_number: i + 1,
        installment_total: n,
      };
    });

    await supabase.from("transactions").insert(rows);

    setSaving(false);
    router.push("/dashboard/transactions");
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

        <h1 className="font-display text-2xl font-medium mb-1">Compra parcelada</h1>
        <p className="text-sm text-ink-soft mb-8">
          Lança todas as parcelas de uma vez, uma por mês a partir da data escolhida.
        </p>

        {accounts.length === 0 ? (
          <p className="text-sm text-ink-faint">
            Cadastre uma conta primeiro em{" "}
            <Link href="/dashboard/accounts/new" className="text-brand font-semibold hover:underline">
              Contas
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-faint">Descrição</span>
              <input
                type="text"
                placeholder="ex: Geladeira"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
              />
            </label>

            <div className="flex gap-3">
              <label className="flex-1 flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-faint">Valor total</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                  className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand transition-colors"
                />
              </label>
              <label className="flex-1 flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-faint">Nº de parcelas</span>
                <input
                  type="number"
                  min={2}
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  required
                  className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand transition-colors"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-faint">Conta / cartão</span>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>

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

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-faint">Data da 1ª parcela</span>
              <input
                type="date"
                value={firstDate}
                onChange={(e) => setFirstDate(e.target.value)}
                className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
              />
            </label>

            {total > 0 && n > 0 && (
              <p className="text-sm text-ink-soft">
                {n}x de <strong>{formatCurrency(perInstallment)}</strong> — a primeira parcela cai
                no saldo assim que registrada, as próximas entram automaticamente no mês certo.
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
            >
              {saving ? "Criando…" : `Criar ${n} parcelas`}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
