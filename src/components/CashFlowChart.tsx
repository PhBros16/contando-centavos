"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { MonthlyFlowPoint } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function CashFlowChart({ data }: { data: MonthlyFlowPoint[] }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="text-[15.5px] font-bold">Fluxo de caixa nos últimos 6 meses</h3>
        <span className="text-xs text-ink-faint">Receitas menos despesas</span>
      </div>
      <div className="h-[190px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--brand))" stopOpacity={0.28} />
                <stop offset="100%" stopColor="rgb(var(--brand))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11.5, fill: "rgb(var(--ink-faint))" }}
              dy={8}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                background: "rgb(var(--paper-raised))",
                border: "1px solid rgb(var(--hairline) / 0.2)",
                borderRadius: 10,
                fontSize: 12.5,
              }}
              labelStyle={{ color: "rgb(var(--ink-soft))" }}
            />
            <Area
              type="monotone"
              dataKey="net"
              stroke="rgb(var(--brand))"
              strokeWidth={2.4}
              fill="url(#areaFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
