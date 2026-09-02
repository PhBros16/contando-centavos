"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Investment, InvestmentOperationRow } from "@/lib/types";
import { computePosition, compoundInterest } from "@/lib/investmentMath";
import { formatCurrency } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  renda_fixa: "Renda fixa",
  acao: "Ações / FIIs",
  cripto: "Cripto",
  fundo: "Fundo",
  outro: "Outro",
};

function monthsBetween(start: string, end: Date): number {
  const s = new Date(start + "T00:00:00");
  return (end.getFullYear() - s.getFullYear()) * 12 + (end.getMonth() - s.getMonth());
}

export function InvestmentDetailClient({
  investment,
  operations,
}: {
  investment: Investment;
  operations: InvestmentOperationRow[];
}) {
  const isMarketAsset = investment.asset_type === "acao" || investment.asset_type === "cripto";

  return (
    <div>
      <h1 className="font-display text-2xl font-medium mb-1">{investment.name}</h1>
      <p className="text-sm text-ink-soft mb-8">{TYPE_LABELS[investment.asset_type]}</p>

      {isMarketAsset ? (
        <MarketAssetDetail investment={investment} operations={operations} />
      ) : (
        <StaticAssetDetail investment={investment} />
      )}
    </div>
  );
}

function MarketAssetDetail({
  investment,
  operations,
}: {
  investment: Investment;
  operations: InvestmentOperationRow[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const details = investment.details as { ticker?: string; current_price?: number };
  const [currentPrice, setCurrentPrice] = useState((details.current_price ?? 0).toString());
  const [editingPrice, setEditingPrice] = useState(false);
  const [opType, setOpType] = useState<"compra" | "venda">("compra");
  const [opQty, setOpQty] = useState("");
  const [opPrice, setOpPrice] = useState("");
  const [opDate, setOpDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const position = computePosition(operations, parseFloat(currentPrice.replace(",", ".")) || 0);

  async function savePrice() {
    const price = parseFloat(currentPrice.replace(",", "."));
    await supabase
      .from("investments")
      .update({ details: { ...details, current_price: price }, current_value: position.currentValue })
      .eq("id", investment.id);
    setEditingPrice(false);
    router.refresh();
  }

  async function addOperation(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("investment_operations").insert({
      household_id: investment.household_id,
      investment_id: investment.id,
      type: opType,
      quantity: parseFloat(opQty.replace(",", ".")),
      price: parseFloat(opPrice.replace(",", ".")),
      operation_date: opDate,
    });
    setOpQty("");
    setOpPrice("");
    setSaving(false);
    router.refresh();
  }

  async function deleteOperation(id: string) {
    if (!confirm("Excluir esta operação?")) return;
    await supabase.from("investment_operations").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        <Stat label="Quantidade" value={position.quantity.toLocaleString("pt-BR")} />
        <Stat label="Preço médio" value={formatCurrency(position.avgBuyPrice)} />
        <div>
          <div className="text-xs font-semibold text-ink-faint mb-1">Preço atual</div>
          {editingPrice ? (
            <div className="flex gap-1.5">
              <input
                autoFocus
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                onBlur={savePrice}
                onKeyDown={(e) => e.key === "Enter" && savePrice()}
                className="w-20 rounded border border-brand bg-paper-raised px-1.5 py-0.5 text-sm font-display outline-none"
              />
            </div>
          ) : (
            <button onClick={() => setEditingPrice(true)} className="font-display text-lg hover:underline">
              {formatCurrency(parseFloat(currentPrice) || 0)}
            </button>
          )}
        </div>
        <Stat label="Valor atual" value={formatCurrency(position.currentValue)} />
        <Stat
          label="Lucro se vender agora"
          value={formatCurrency(position.unrealizedProfit)}
          color={position.unrealizedProfit >= 0 ? "brand" : "wine"}
        />
        <Stat
          label="Lucro total (real. + não real.)"
          value={`${formatCurrency(position.totalProfit)} (${position.profitPct >= 0 ? "+" : ""}${position.profitPct.toFixed(1)}%)`}
          color={position.totalProfit >= 0 ? "brand" : "wine"}
        />
      </div>

      <div>
        <h3 className="text-[15.5px] font-bold mb-3">Registrar operação</h3>
        <form onSubmit={addOperation} className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-hairline shrink-0">
            <button
              type="button"
              onClick={() => setOpType("compra")}
              className={`px-3 py-1.5 text-xs font-bold ${opType === "compra" ? "bg-brand text-paper-raised" : "text-ink-soft"}`}
            >
              Compra
            </button>
            <button
              type="button"
              onClick={() => setOpType("venda")}
              className={`px-3 py-1.5 text-xs font-bold ${opType === "venda" ? "bg-wine text-paper-raised" : "text-ink-soft"}`}
            >
              Venda
            </button>
          </div>
          <input
            placeholder="Quantidade"
            value={opQty}
            onChange={(e) => setOpQty(e.target.value)}
            inputMode="decimal"
            required
            className="w-28 rounded-lg border border-hairline bg-paper-raised px-2.5 py-1.5 text-sm font-display outline-none focus:border-brand"
          />
          <input
            placeholder="Preço"
            value={opPrice}
            onChange={(e) => setOpPrice(e.target.value)}
            inputMode="decimal"
            required
            className="w-28 rounded-lg border border-hairline bg-paper-raised px-2.5 py-1.5 text-sm font-display outline-none focus:border-brand"
          />
          <input
            type="date"
            value={opDate}
            onChange={(e) => setOpDate(e.target.value)}
            className="rounded-lg border border-hairline bg-paper-raised px-2.5 py-1.5 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-1.5 rounded-lg bg-ink text-paper text-xs font-bold"
          >
            {saving ? "…" : "Adicionar"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-[15.5px] font-bold mb-3">Histórico de compra e venda</h3>
        {operations.length === 0 && <p className="text-sm text-ink-faint">Nenhuma operação ainda.</p>}
        <div>
          {operations.map((op) => (
            <div key={op.id} className="flex items-center gap-3 py-2.5 border-b border-hairline last:border-none">
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{
                  color: op.type === "compra" ? "rgb(var(--brand))" : "rgb(var(--wine))",
                  background: op.type === "compra" ? "rgb(var(--brand) / 0.1)" : "rgb(var(--wine) / 0.1)",
                }}
              >
                {op.type === "compra" ? "Compra" : "Venda"}
              </span>
              <span className="text-xs text-ink-faint shrink-0">
                {new Date(op.operation_date + "T00:00:00").toLocaleDateString("pt-BR")}
              </span>
              <span className="flex-1 text-sm">
                {op.quantity} × {formatCurrency(op.price)}
              </span>
              <span className="font-display text-sm shrink-0">{formatCurrency(op.quantity * op.price)}</span>
              <button
                onClick={() => deleteOperation(op.id)}
                className="text-xs text-ink-faint hover:text-wine shrink-0"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StaticAssetDetail({ investment }: { investment: Investment }) {
  const router = useRouter();
  const supabase = createClient();

  const details = investment.details as { rate_pct?: number; rate_period?: "mensal" | "anual"; start_date?: string };
  const [investedAmount, setInvestedAmount] = useState(investment.invested_amount.toString());
  const [ratePct, setRatePct] = useState((details.rate_pct ?? "").toString());
  const [manualCurrentValue, setManualCurrentValue] = useState(investment.current_value.toString());
  const [saving, setSaving] = useState(false);

  const isRendaFixa = investment.asset_type === "renda_fixa";

  const projectedValue =
    isRendaFixa && details.rate_pct && details.start_date
      ? compoundInterest(
          parseFloat(investedAmount.replace(",", ".")) || 0,
          details.rate_pct,
          Math.max(
            details.rate_period === "anual"
              ? monthsBetween(details.start_date, new Date()) / 12
              : monthsBetween(details.start_date, new Date()),
            0
          )
        )
      : parseFloat(manualCurrentValue.replace(",", ".")) || 0;

  const profit = projectedValue - (parseFloat(investedAmount.replace(",", ".")) || 0);

  async function handleSave() {
    setSaving(true);
    const amount = parseFloat(investedAmount.replace(",", "."));
    const newDetails = isRendaFixa
      ? { ...details, rate_pct: parseFloat(ratePct.replace(",", ".")) || 0 }
      : { ...details, rate_pct: parseFloat(ratePct.replace(",", ".")) || 0 };

    await supabase
      .from("investments")
      .update({
        invested_amount: amount,
        current_value: isRendaFixa ? projectedValue : parseFloat(manualCurrentValue.replace(",", ".")) || 0,
        details: newDetails,
      })
      .eq("id", investment.id);

    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        <Stat label="Investido" value={formatCurrency(parseFloat(investedAmount) || 0)} />
        <Stat label={isRendaFixa ? "Valor projetado hoje" : "Valor atual"} value={formatCurrency(projectedValue)} />
        <Stat
          label="Lucro / prejuízo"
          value={formatCurrency(profit)}
          color={profit >= 0 ? "brand" : "wine"}
        />
      </div>

      <div className="flex flex-col gap-4 max-w-sm">
        <h3 className="text-[15.5px] font-bold">Editar</h3>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink-faint">Valor investido</span>
          <input
            value={investedAmount}
            onChange={(e) => setInvestedAmount(e.target.value)}
            inputMode="decimal"
            className="rounded-lg border border-hairline bg-paper-raised px-3 py-2 text-sm font-display outline-none focus:border-brand"
          />
        </label>

        {(isRendaFixa || investment.asset_type === "fundo") && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-faint">
              Taxa {isRendaFixa ? `(% ao ${details.rate_period === "anual" ? "ano" : "mês"})` : "(% ao mês, aprox.)"}
            </span>
            <input
              value={ratePct}
              onChange={(e) => setRatePct(e.target.value)}
              inputMode="decimal"
              className="rounded-lg border border-hairline bg-paper-raised px-3 py-2 text-sm font-display outline-none focus:border-brand"
            />
          </label>
        )}

        {!isRendaFixa && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-faint">Valor atual (manual)</span>
            <input
              value={manualCurrentValue}
              onChange={(e) => setManualCurrentValue(e.target.value)}
              inputMode="decimal"
              className="rounded-lg border border-hairline bg-paper-raised px-3 py-2 text-sm font-display outline-none focus:border-brand"
            />
          </label>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand text-paper-raised rounded-lg py-2 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: "brand" | "wine" }) {
  return (
    <div>
      <div className="text-xs font-semibold text-ink-faint mb-1">{label}</div>
      <div
        className="font-display text-lg"
        style={color ? { color: `rgb(var(--${color}))` } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
