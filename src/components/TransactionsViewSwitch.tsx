import Link from "next/link";

export function TransactionsViewSwitch({ active }: { active: "lista" | "periodo" }) {
  return (
    <div className="inline-flex rounded-full border border-hairline p-0.5 mb-5 text-sm">
      <Link
        href="/dashboard/transactions"
        className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors ${
          active === "lista" ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
        }`}
      >
        Lista
      </Link>
      <Link
        href="/dashboard/statement"
        className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors ${
          active === "periodo" ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
        }`}
      >
        Por período
      </Link>
    </div>
  );
}
