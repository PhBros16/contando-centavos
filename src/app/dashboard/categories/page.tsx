import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { CategoryManager } from "@/components/CategoryManager";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("kind").order("name");

  return (
    <div className="flex min-h-screen">
      <Sidebar activeLabel="Categorias" />

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

        <h1 className="font-display text-2xl font-medium mb-1">Categorias</h1>
        <p className="text-sm text-ink-soft mb-8">
          Organize suas transações. Vieram algumas prontas — adicione, edite a cor ou o ícone à vontade.
        </p>

        <CategoryManager initialCategories={(categories ?? []) as Category[]} />
      </main>
    </div>
  );
}
