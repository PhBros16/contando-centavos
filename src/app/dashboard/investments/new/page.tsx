"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { AssetType } from "@/lib/types";

const ASSET_TYPES: { value: AssetType; label: string; hint: string }[] = [
  { value: "renda_fixa", label: "Renda fixa", hint: "CDB, Tesouro Direto, LCI/LCA, poupança" },
  { value: "acao", label: "Ações / FIIs", hint: "Compra e venda com preço médio" },
  { value: "cripto", label: "Cripto", hint: "Compra e venda com preço médio" },
  { value: "fundo", label: "Fundo de investimento", hint: "Rentabilidade histórica aproximada" },
  { value: "outro", label: "Outro", hint: "Controle manual simples" },
];

export default function NewInvestmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [assetType, setAssetType] = useState<AssetType>("renda_fixa");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Renda fixa / fundo
  const [investedAmount, setInvestedAmount] = useState("");
  const [ratePct, setRatePct] = useState("");
  const [ratePeriod, setRatePeriod] = useState<"mensal" | "anual">("mensal");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  // Ações / FIIs / Cripto — primeira compra
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [operationDate, setOperationDate] = useState(new Date().toISOString().slice(0, 10));

  const isMarketAsset = assetType === "acao" || assetType === "cripto";

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

    const householdId = profile!.household_id;

    if (isMarketAsset) {
      const qty = parseFloat(quantity.replace(",", "."));
      const price = parseFloat(buyPrice.replace(",", "."));

      const { data: inv, error: invError } = await supabase
        .from("investments")
        .insert({
          household_id: householdId,
          name: name || ticker,
          asset_type: assetType,
          invested_amount: qty * price,
          current_value: qty * price,
          details: { ticker, current_price: price },
        })
        .select()
        .single();

      if (invError || !inv) {
        setError(invError?.message ?? "Erro ao criar investimento.");
        setSaving(false);
        return;
      }

      await supabase.from("investment_operations").insert({
        household_id: householdId,
        investment_id: inv.id,
        type: "compra",
        quantity: qty,
        price,
        operation_date: operationDate,
      });
    } else {
      const amount = parseFloat(investedAmount.replace(",", "."));
      const details =
        assetType === "renda_fixa"
          ? { rate_pct: parseFloat(ratePct.replace(",", ".")) || 0, rate_period: ratePeriod, start_date: startDate }
          : assetType === "fundo"
          ? { rate_pct: parseFloat(ratePct.replace(",", ".")) || 0 }
          : {};

      const { error: invError } = await supabase.from("investments").insert({
        household_id: householdId,
        name,
        asset_type: assetType,
        invested_amount: amount,
        current_value: amount,
        details,
      });

      if (invError) {
        setError(invError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    router.push("/dashboard/investments");
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10 flex justify-center">
      <div className="w-full max-w-lg">
        <Link
          href="/dashboard/investments"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-8 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <h1 className="font-display text-2xl font-medium mb-1">Novo investimento</h1>
        <p className="text-sm text-ink-soft mb-8">Escolha o tipo — os campos mudam conforme a escolha.</p>

        <div className="grid grid-cols-2 gap-2 mb-7">
          {ASSET_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setAssetType(t.value)}
              className={`text-left p-3 rounded-lg border transition-colors ${
                assetType === t.value ? "border-brand bg-brand-soft/10" : "border-hairline"
              }`}
            >
              <div className="text-sm font-semibold">{t.label}</div>
              <div className="text-xs text-ink-faint mt-0.5">{t.hint}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isMarketAsset ? (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-faint">Ticker / código do ativo</span>
                <input
                  type="text"
                  placeholder={assetType === "cripto" ? "ex: BTC" : "ex: PETR4"}
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  required
                  className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-faint">Nome (opcional)</span>
                <input
                  type="text"
                  placeholder="ex: Petrobras PN"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
                />
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-ink-faint">Quantidade</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand transition-colors"
                  />
                </label>
                <label className="flex-1 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-ink-faint">Preço de compra (un.)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="R$ 0,00"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    required
                    className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand transition-colors"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-faint">Data da compra</span>
                <input
                  type="date"
                  value={operationDate}
                  onChange={(e) => setOperationDate(e.target.value)}
                  className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
                />
              </label>
              <p className="text-xs text-ink-faint">
                Você poderá registrar mais compras, vendas e atualizar o preço atual na tela do
                ativo.
              </p>
            </>
          ) : (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-faint">Nome</span>
                <input
                  type="text"
                  placeholder={assetType === "renda_fixa" ? "ex: CDB Banco X 120% CDI" : "ex: Fundo XP Ações"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-faint">Valor investido</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  value={investedAmount}
                  onChange={(e) => setInvestedAmount(e.target.value)}
                  required
                  className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand transition-colors"
                />
              </label>

              {(assetType === "renda_fixa" || assetType === "fundo") && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-ink-faint">
                    Taxa de rendimento {assetType === "fundo" && "(histórica aproximada)"}
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="ex: 0,9"
                      value={ratePct}
                      onChange={(e) => setRatePct(e.target.value)}
                      className="flex-1 rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand transition-colors"
                    />
                    {assetType === "renda_fixa" && (
                      <select
                        value={ratePeriod}
                        onChange={(e) => setRatePeriod(e.target.value as "mensal" | "anual")}
                        className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
                      >
                        <option value="mensal">% ao mês</option>
                        <option value="anual">% ao ano</option>
                      </select>
                    )}
                    {assetType === "fundo" && <span className="flex items-center text-sm text-ink-faint">% ao mês</span>}
                  </div>
                </label>
              )}

              {assetType === "renda_fixa" && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-ink-faint">Data de aplicação</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
                  />
                </label>
              )}
            </>
          )}

          {error && <p className="text-sm text-wine">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
          >
            {saving ? "Salvando…" : "Adicionar investimento"}
          </button>
        </form>
      </div>
    </main>
  );
}
