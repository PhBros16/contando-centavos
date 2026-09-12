import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { EditableTransactionRow } from "@/components/EditableTransactionRow";
import { QuickAddTransaction } from "@/components/QuickAddTransaction";
import type { Account, Category, Profile, Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { category?: string; account?: string; from?: string; to?: string; q?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: accounts }, { data: categories }, { data: profile }] = await Promise.all([
    supabase.from("accounts").select("*").order("name"),
    supabase.from("categories").select("*").order("kind").order("name"),
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
  ]);

  let query = supabase
    .from("transactions")
    .select("*, category:categories(name, color, icon)")
    .order("occurred_at", { ascending: false })
    .limit(200);

  if (searchParams.category) query = query.eq("category_id", searchParams.category);
  if (searchParams.account) query = query.eq("account_id", searchParams.account);
  if (searchParams.from) query = query.gte("occurred_at", searchParams.from);
  if (searchParams.to) query = query.lte("occurred_at", searchParams.to);
  if (searchParams.q) query = query.ilike("description", `%${searchParams.q}%`);

  const { data: transactions } = await query;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-3xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-6 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <h1 className="font-display text-2xl font-medium mb-1">Transações</h1>
        <div className="flex justify-between items-baseline mb-6">
          <p className="text-sm text-ink-soft">
            Busque, filtre, edite ou apague qualquer lançamento. (Quer ver por período, tipo um
            extrato de banco? Veja "Extrato" no menu.)
          </p>
          <Link href="/dashboard/transactions/installment/new" className="text-sm font-semibold text-brand hover:underline">
            + Compra parcelada
          </Link>
        </div>

        {accounts && accounts.length > 0 && profile ? (
          <div className="mb-7">
            <QuickAddTransaction
              accountId={accounts[0].id}
              householdId={(profile as Profile).household_id}
              topCategories={(categories ?? []).slice(0, 6) as Category[]}
            />
          </div>
        ) : null}

        <form method="get" className="flex flex-wrap gap-2.5 mb-7">
          <input
            type="text"
            name="q"
            placeholder="Buscar descrição…"
            defaultValue={searchParams.q}
            className="flex-1 min-w-[140px] rounded-lg border border-hairline bg-paper-raised px-3 py-2 text-sm outline-none focus:border-brand transition-colors"
          />
          <select
            name="category"
            defaultValue={searchParams.category ?? ""}
            className="rounded-lg border border-hairline bg-paper-raised px-2.5 py-2 text-sm outline-none focus:border-brand transition-colors"
          >
            <option value="">Todas categorias</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
          <select
            name="account"
            defaultValue={searchParams.account ?? ""}
            className="rounded-lg border border-hairline bg-paper-raised px-2.5 py-2 text-sm outline-none focus:border-brand transition-colors"
          >
            <option value="">Todas contas</option>
            {(accounts ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-ink-faint">
            De
            <input
              type="date"
              name="from"
              defaultValue={searchParams.from}
              className="rounded-lg border border-hairline bg-paper-raised px-2.5 py-2 text-sm text-ink outline-none focus:border-brand transition-colors"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-ink-faint">
            Até
            <input
              type="date"
              name="to"
              defaultValue={searchParams.to}
              className="rounded-lg border border-hairline bg-paper-raised px-2.5 py-2 text-sm text-ink outline-none focus:border-brand transition-colors"
            />
          </label>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-ink text-paper text-sm font-semibold hover:opacity-85 transition-opacity"
          >
            Filtrar
          </button>
          {(searchParams.category || searchParams.account || searchParams.from || searchParams.to || searchParams.q) && (
            <Link
              href="/dashboard/transactions"
              className="px-4 py-2 rounded-lg border border-hairline text-sm text-ink-soft hover:text-ink"
            >
              Limpar
            </Link>
          )}
        </form>

        {(!transactions || transactions.length === 0) && (
          <p className="text-sm text-ink-faint">Nenhuma transação encontrada com esses filtros.</p>
        )}

        <div>
          {(transactions ?? []).map((tx) => (
            <EditableTransactionRow
              key={tx.id}
              transaction={tx as Transaction}
              categories={(categories ?? []) as Category[]}
              accounts={(accounts ?? []) as Account[]}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
