import Link from "next/link";
import type { Bill } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function DueSoonBanner({ bills }: { bills: Bill[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const in3Days = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);

  const urgent = bills.filter((b) => b.status !== "pago" && b.due_date <= in3Days);
  if (urgent.length === 0) return null;

  const overdue = urgent.filter((b) => b.due_date < today);
  const total = urgent.reduce((s, b) => s + Number(b.amount), 0);

  return (
    <Link
      href="/dashboard/bills/new"
      className="flex items-center gap-3 rounded-card px-4 py-3 mb-6 text-sm transition-opacity hover:opacity-90"
      style={{ background: "rgb(var(--wine) / 0.1)", color: "rgb(var(--wine))" }}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" strokeWidth="2" stroke="currentColor">
        <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
        <path d="M10.3 3.9 2.7 17a1.7 1.7 0 0 0 1.5 2.6h15.6a1.7 1.7 0 0 0 1.5-2.6L13.7 3.9a1.7 1.7 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="flex-1">
        <strong>{urgent.length}</strong> conta{urgent.length > 1 ? "s" : ""}
        {overdue.length > 0 ? " atrasada(s) ou vencendo" : " vencendo"} nos próximos dias —{" "}
        {formatCurrency(total)} no total
      </span>
    </Link>
  );
}
