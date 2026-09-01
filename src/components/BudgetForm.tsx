"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

export function BudgetForm({
  categories,
  initialValues,
  monthRef,
  householdId,
}: {
  categories: Category[];
  initialValues: Record<string, number>;
  monthRef: string; // formato 'YYYY-MM-01'
  householdId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(categories.map((c) => [c.id, initialValues[c.id]?.toString() ?? ""]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateValue(categoryId: string, value: string) {
    setValues((prev) => ({ ...prev, [categoryId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const rows = categories
      .map((c) => ({
        household_id: householdId,
        category_id: c.id,
        month: monthRef,
        limit_amount: parseFloat((values[c.id] || "0").replace(",", ".")),
      }))
      .filter((r) => r.limit_amount > 0);

    if (rows.length > 0) {
      const { error } = await supabase
        .from("budgets")
        .upsert(rows, { onConflict: "household_id,category_id,month" });

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {categories.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-3 py-2.5 border-b border-hairline last:border-none"
        >
          <span className="w-6 text-center shrink-0">{c.icon}</span>
          <span className="flex-1 text-sm font-medium">{c.name}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-ink-faint">R$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={values[c.id]}
              onChange={(e) => updateValue(c.id, e.target.value)}
              className="w-24 rounded-lg border border-hairline bg-paper-raised px-2.5 py-1.5 text-sm font-display text-right outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>
      ))}

      {categories.length === 0 && (
        <p className="text-sm text-ink-faint">
          Você ainda não tem categorias de despesa. Crie algumas primeiro na tela de Categorias.
        </p>
      )}

      {error && <p className="text-sm text-wine mt-2">{error}</p>}

      {categories.length > 0 && (
        <button
          type="submit"
          disabled={saving}
          className="mt-5 bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar orçamento do mês"}
        </button>
      )}
    </form>
  );
}
