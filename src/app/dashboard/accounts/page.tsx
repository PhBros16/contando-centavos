import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { AccountCard } from "@/components/AccountCard";
import type { Account } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const supabase = createClient();

  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from("accounts").select("*").eq("archived", false).order("created_at"),
    supabase.from("transactions").select("account_id, amount"),
  ]);

  const balances: Record<string, number> = {};
  for (const acc of (accounts ?? []) as Account[]) {
    balances[acc.id] = Number(acc.initial_balance);
  }
  for (const t of transactions ?? []) {
    if (balances[t.account_id] !== undefined) {
      balances[t.account_id] += Number(t.amount);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-6 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <div className="flex justify-between items-baseline mb-8">
          <div>
            <h1 className="font-display text-2xl font-medium mb-1">Contas</h1>
            <p className="text-sm text-ink-soft">Saldo individual de cada uma.</p>
          </div>
          <Link href="/dashboard/accounts/new" className="text-sm font-semibold text-brand hover:underline">
            + Nova conta
          </Link>
        </div>

        {(!accounts || accounts.length === 0) && (
          <Link
            href="/dashboard/accounts/new"
            className="flex items-center justify-between gap-3 rounded-card border border-dashed border-hairline px-4 py-3.5 text-sm text-ink-soft hover:text-ink transition-colors"
          >
            Nenhuma conta ainda — criar a primeira
          </Link>
        )}

        <div className="flex flex-col gap-3">
          {(accounts ?? []).map((acc) => (
            <AccountCard key={acc.id} account={acc as Account} balance={balances[acc.id] ?? 0} />
          ))}
        </div>
      </main>
    </div>
  );
}
