"use client";

import { useState } from "react";
import { futureValueOfContributions, compoundInterest, sellProfitEstimate } from "@/lib/investmentMath";
import { formatCurrency } from "@/lib/format";

const TABS = [
  { id: "aportes", label: "Aportes mensais" },
  { id: "rendimento", label: "Rendimento composto" },
  { id: "venda", label: "Vender ação agora" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CalculatorsClient() {
  const [tab, setTab] = useState<TabId>("aportes");

  return (
    <div>
      <div className="flex rounded-lg overflow-hidden border border-hairline mb-8 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? "bg-brand text-paper-raised" : "text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "aportes" && <AportesCalculator />}
      {tab === "rendimento" && <RendimentoCalculator />}
      {tab === "venda" && <VendaCalculator />}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-ink-faint">{label}</span>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          className="flex-1 rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand transition-colors"
        />
        {suffix && <span className="text-sm text-ink-faint shrink-0">{suffix}</span>}
      </div>
    </label>
  );
}

function ResultCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-card border border-hairline p-5 mt-6 flex flex-col gap-3">{children}</div>;
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className={highlight ? "text-sm font-semibold" : "text-xs text-ink-faint"}>{label}</span>
      <span
        className={highlight ? "font-display text-xl" : "font-display text-base"}
        style={highlight ? { color: "var(--gold)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

function num(v: string): number {
  return parseFloat(v.replace(",", ".")) || 0;
}

function AportesCalculator() {
  const [initial, setInitial] = useState("0");
  const [monthly, setMonthly] = useState("500");
  const [rate, setRate] = useState("0,8");
  const [months, setMonths] = useState("24");

  const total = futureValueOfContributions({
    initialAmount: num(initial),
    monthlyContribution: num(monthly),
    monthlyRatePct: num(rate),
    months: num(months),
  });
  const contributed = num(initial) + num(monthly) * num(months);
  const earned = total - contributed;

  return (
    <div>
      <p className="text-sm text-ink-soft mb-6">
        "Se eu guardar um valor todo mês, quanto vou ter no final?"
      </p>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Field label="Valor inicial" value={initial} onChange={setInitial} suffix="R$" />
        <Field label="Aporte mensal" value={monthly} onChange={setMonthly} suffix="R$" />
        <Field label="Rendimento" value={rate} onChange={setRate} suffix="% a.m." />
        <Field label="Prazo" value={months} onChange={setMonths} suffix="meses" />
      </div>
      <ResultCard>
        <ResultRow label="Total investido (seu bolso)" value={formatCurrency(contributed)} />
        <ResultRow label="Rendimento ganho" value={formatCurrency(earned)} />
        <div className="h-px bg-hairline" />
        <ResultRow label="Valor final" value={formatCurrency(total)} highlight />
      </ResultCard>
    </div>
  );
}

function RendimentoCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("1");
  const [months, setMonths] = useState("12");

  const total = compoundInterest(num(principal), num(rate), num(months));
  const profit = total - num(principal);

  return (
    <div>
      <p className="text-sm text-ink-soft mb-6">
        "Se minha aplicação render X% ao mês, quanto de lucro vou ter daqui a Y meses?"
      </p>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Field label="Valor aplicado" value={principal} onChange={setPrincipal} suffix="R$" />
        <Field label="Rendimento" value={rate} onChange={setRate} suffix="% a.m." />
        <Field label="Prazo" value={months} onChange={setMonths} suffix="meses" />
      </div>
      <ResultCard>
        <ResultRow label="Valor aplicado" value={formatCurrency(num(principal))} />
        <ResultRow label="Lucro no período" value={formatCurrency(profit)} />
        <div className="h-px bg-hairline" />
        <ResultRow label="Valor final" value={formatCurrency(total)} highlight />
      </ResultCard>
    </div>
  );
}

function VendaCalculator() {
  const [quantity, setQuantity] = useState("100");
  const [avgPrice, setAvgPrice] = useState("25");
  const [sellPrice, setSellPrice] = useState("30");

  const result = sellProfitEstimate(num(quantity), num(avgPrice), num(sellPrice));

  return (
    <div>
      <p className="text-sm text-ink-soft mb-6">
        "Se eu vender minha ação a um preço X, quanto de lucro fico por ação e no total?"
      </p>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Field label="Quantidade" value={quantity} onChange={setQuantity} />
        <Field label="Preço médio de compra" value={avgPrice} onChange={setAvgPrice} suffix="R$" />
        <Field label="Preço de venda" value={sellPrice} onChange={setSellPrice} suffix="R$" />
      </div>
      <ResultCard>
        <ResultRow label="Lucro por ação" value={formatCurrency(result.profitPerUnit)} />
        <ResultRow label="Receita total da venda" value={formatCurrency(result.totalRevenue)} />
        <div className="h-px bg-hairline" />
        <ResultRow
          label="Lucro total"
          value={formatCurrency(result.totalProfit)}
          highlight
        />
      </ResultCard>
      <p className="text-xs text-ink-faint mt-3">
        Dica: se o ativo já está cadastrado em Investimentos, a tela dele já mostra esse cálculo
        automaticamente com o preço médio real.
      </p>
    </div>
  );
}
