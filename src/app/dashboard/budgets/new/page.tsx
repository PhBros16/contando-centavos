import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { BudgetForm } from "@/components/BudgetForm";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewBudgetPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("household_id")
    .eq("id", user!.id)
    .single();

  const householdId = profile!.household_id;
  const monthRef = new Date().toISOString().slice(0, 8) + "01";

  const [{ data: categories }, { data: existingBudgets }] = await Promise.all([
    supabase.from("categories").select("*").eq("kind", "despesa").order("name"),
    supabase.from("budgets").select("category_id, limit_amount").eq("month", monthRef),
  ]);

  const initialValues = Object.fromEntries(
    (existingBudgets ?? []).map((b) => [b.category_id, Number(b.limit_amount)])
  );

  const monthLabel = new Date(monthRef + "T00:00:00").toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-6 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <h1 className="font-display text-2xl font-medium mb-1">Orçamento de {monthLabel}</h1>
        <p className="text-sm text-ink-soft mb-8">
          Defina quanto você quer gastar em cada categoria este mês. Deixe em branco as que não
          quer limitar.
        </p>

        <BudgetForm
          categories={(categories ?? []) as Category[]}
          initialValues={initialValues}
          monthRef={monthRef}
          householdId={householdId}
        />
      </main>
    </div>
  );
}
