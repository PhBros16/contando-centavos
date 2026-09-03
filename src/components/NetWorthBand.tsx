import Link from "next/link";
import { formatCurrency } from "@/lib/format";

export function NetWorthBand({
  liquidBalance,
  investmentsValue,
}: {
  liquidBalance: number;
  investmentsValue: number;
}) {
  const netWorth = liquidBalance + investmentsValue;

  if (investmentsValue === 0) return null; // sem investimentos, não há o que consolidar ainda

  return (
    <Link
      href="/dashboard/investments"
      className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-ink-faint py-3 border-b border-hairline hover:text-ink-soft transition-colors"
    >
      <span>
        Patrimônio líquido total:{" "}
        <strong className="font-display text-sm text-ink not-italic">{formatCurrency(netWorth)}</strong>
      </span>
      <span className="text-ink-faint/70">
        ({formatCurrency(liquidBalance)} em contas + {formatCurrency(investmentsValue)} investidos)
      </span>
    </Link>
  );
}
