"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function SimulatorForm({
  categories,
  categorySpend,
  baselineForecast,
}: {
  categories: Category[];
  categorySpend: Record<string, number>;
  baselineForecast: number;
}) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [cutPct, setCutPct] = useState(20);

  const monthlySpend = categorySpend[categoryId] ?? 0;
  const savings = (monthlySpend * cutPct) / 100;
  const newForecast = baselineForecast + savings;

  if (categories.length === 0) {
    return <p className="text-sm text-ink-faint">Cadastre categorias de despesa primeiro.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink-faint">Categoria</span>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name} — média de {formatCurrency(categorySpend[c.id] ?? 0)}/mês
            </option>
          ))}
        </select>
      </label>

      <div>
        <div className="flex justify-between text-xs font-semibold text-ink-faint mb-2">
          <span>Cortar</span>
          <span className="text-brand">{cutPct}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={cutPct}
          onChange={(e) => setCutPct(Number(e.target.value))}
          className="w-full accent-brand"
        />
      </div>

      <div className="rounded-card border border-hairline p-5">
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-xs text-ink-faint">Previsão atual (30 dias)</span>
          <span className="font-display text-lg">{formatCurrency(baselineForecast)}</span>
        </div>
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-xs text-ink-faint">Economia estimada</span>
          <span className="font-display text-lg text-brand">+{formatCurrency(savings)}</span>
        </div>
        <div className="h-px bg-hairline my-3" />
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-semibold">Nova previsão</span>
          <span className="font-display text-xl" style={{ color: "var(--gold)" }}>
            {formatCurrency(newForecast)}
          </span>
        </div>
      </div>

      <p className="text-xs text-ink-faint leading-relaxed">
        Cálculo baseado na sua média de gastos dessa categoria nos últimos 6 meses, aplicado sobre
        a previsão atual de 30 dias.
      </p>
    </div>
  );
}
