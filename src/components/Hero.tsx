"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/format";

export function Hero({
  balance,
  deltaPct,
  income,
  expense,
  sparklinePoints,
}: {
  balance: number;
  deltaPct: number;
  income: number;
  expense: number;
  sparklinePoints: string;
}) {
  const displayed = useCountUp(balance);

  return (
    <section className="flex flex-wrap items-end gap-10 md:gap-14 py-7 md:py-8 border-b border-hairline">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink-faint">Saldo total</span>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-display text-[38px] md:text-[52px] font-medium leading-none">
            {formatCurrency(displayed)}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              deltaPct >= 0 ? "bg-brand-soft/10 text-brand" : "bg-wine-soft/10 text-wine"
            }`}
          >
            {deltaPct >= 0 ? "+" : ""}
            {deltaPct.toFixed(1)}% este mês
          </span>
        </div>
        <svg width="220" height="40" viewBox="0 0 220 40" className="mt-1">
          <path
            d={sparklinePoints}
            fill="none"
            stroke="rgb(var(--brand))"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </div>

      <div className="flex gap-8 md:gap-10 md:ml-auto">
        <div className="pl-6 border-l border-hairline">
          <span className="text-xs font-semibold text-ink-faint">Receitas no mês</span>
          <div className="font-display text-xl md:text-[22px] font-medium mt-1 text-brand">
            {formatCurrency(income)}
          </div>
        </div>
        <div className="pl-6 border-l border-hairline">
          <span className="text-xs font-semibold text-ink-faint">Despesas no mês</span>
          <div className="font-display text-xl md:text-[22px] font-medium mt-1 text-wine">
            {formatCurrency(expense)}
          </div>
        </div>
      </div>
    </section>
  );
}

function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let frame: number;
    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}
