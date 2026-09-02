import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { InvestmentDetailClient } from "@/components/InvestmentDetailClient";
import type { Investment, InvestmentOperationRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InvestmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: investment } = await supabase.from("investments").select("*").eq("id", params.id).single();
  if (!investment) notFound();

  const { data: operations } = await supabase
    .from("investment_operations")
    .select("*")
    .eq("investment_id", params.id)
    .order("operation_date", { ascending: false });

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-2xl">
        <Link
          href="/dashboard/investments"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-6 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <InvestmentDetailClient
          investment={investment as Investment}
          operations={(operations ?? []) as InvestmentOperationRow[]}
        />
      </main>
    </div>
  );
}
