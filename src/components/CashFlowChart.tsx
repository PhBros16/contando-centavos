"use client";

import { useRouter } from "next/navigation";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { MonthlyFlowPoint } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

const PERIOD_OPTIONS = [
  { value: 3, label: "3 meses" },
  { value: 6, label: "6 meses" },
  { value: 12, label: "12 meses" },
  { value: 24, label: "24 meses" },
];

export function CashFlowChart({ data, months }: { data: MonthlyFlowPoint[]; months: number }) {
  const router = useRouter();

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-baseline mb-4">
        <h3 className="text-[15.5px] font-bold">Fluxo de caixa</h3>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-ink-faint hidden sm:inline">Receitas menos despesas</span>
          <select
            value={months}
            onChange={(e) => router.push(`/dashboard?months=${e.target.value}`)}
            className="text-xs rounded-lg border border-hairline bg-paper-raised px-2 py-1 outline-none focus:border-brand"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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
              interval={months > 12 ? Math.ceil(months / 12) - 1 : 0}
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
