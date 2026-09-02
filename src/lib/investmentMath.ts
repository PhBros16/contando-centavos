export type InvestmentOperation = {
  id: string;
  investment_id: string;
  type: "compra" | "venda";
  quantity: number;
  price: number;
  operation_date: string;
};

/**
 * Valor futuro de um valor único a juros compostos.
 * Ex: R$1.000 rendendo 1% ao mês por 12 meses.
 */
export function compoundInterest(principal: number, ratePct: number, periods: number): number {
  return principal * Math.pow(1 + ratePct / 100, periods);
}

/**
 * Valor futuro de aportes mensais regulares (mais um valor inicial opcional),
 * a uma taxa mensal fixa. Fórmula de valor futuro de uma série uniforme.
 * Ex: "se eu guardar R$500 todo mês rendendo 0,8% ao mês, quanto terei em 24 meses?"
 */
export function futureValueOfContributions({
  monthlyContribution,
  monthlyRatePct,
  months,
  initialAmount = 0,
}: {
  monthlyContribution: number;
  monthlyRatePct: number;
  months: number;
  initialAmount?: number;
}): number {
  const r = monthlyRatePct / 100;

  const futureValueOfInitial = compoundInterest(initialAmount, monthlyRatePct, months);

  // Séries com taxa zero: soma simples (evita divisão por zero na fórmula de anuidade)
  if (r === 0) {
    return futureValueOfInitial + monthlyContribution * months;
  }

  const futureValueOfSeries = monthlyContribution * ((Math.pow(1 + r, months) - 1) / r);
  return futureValueOfInitial + futureValueOfSeries;
}

/**
 * Calcula a posição consolidada de um ativo (ação, FII, cripto) a partir do
 * histórico de compras e vendas: preço médio, quantidade atual, lucro
 * realizado (do que já foi vendido) e não realizado (do que ainda está em
 * carteira, a valor de mercado atual).
 *
 * Simplificação assumida: usa um único "preço médio" para todas as vendas,
 * em vez de FIFO/LIFO — abordagem comum e suficiente pra controle pessoal.
 */
export function computePosition(operations: InvestmentOperation[], currentPrice: number) {
  const buys = operations.filter((o) => o.type === "compra");
  const sells = operations.filter((o) => o.type === "venda");

  const totalBoughtQty = buys.reduce((s, o) => s + Number(o.quantity), 0);
  const totalBoughtCost = buys.reduce((s, o) => s + Number(o.quantity) * Number(o.price), 0);
  const avgBuyPrice = totalBoughtQty > 0 ? totalBoughtCost / totalBoughtQty : 0;

  const totalSoldQty = sells.reduce((s, o) => s + Number(o.quantity), 0);
  const currentQty = totalBoughtQty - totalSoldQty;

  const realizedProfit = sells.reduce(
    (s, o) => s + Number(o.quantity) * (Number(o.price) - avgBuyPrice),
    0
  );

  const currentValue = currentQty * currentPrice;
  const unrealizedProfit = currentQty * (currentPrice - avgBuyPrice);
  const totalProfit = realizedProfit + unrealizedProfit;
  const costBasis = totalBoughtCost; // total já investido, histórico
  const profitPct = costBasis > 0 ? (totalProfit / costBasis) * 100 : 0;

  return {
    quantity: currentQty,
    avgBuyPrice,
    totalBoughtCost,
    currentValue,
    realizedProfit,
    unrealizedProfit,
    totalProfit,
    profitPct,
  };
}

/**
 * Lucro (por unidade e total) de vender uma posição a um preço hipotético —
 * usado no "e se eu vender agora" do simulador.
 */
export function sellProfitEstimate(quantity: number, avgBuyPrice: number, sellPrice: number) {
  const profitPerUnit = sellPrice - avgBuyPrice;
  return {
    profitPerUnit,
    totalProfit: profitPerUnit * quantity,
    totalRevenue: sellPrice * quantity,
  };
}
