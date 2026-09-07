import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { PartnershipManager } from "@/components/PartnershipManager";
import { formatCurrency } from "@/lib/format";
import type { Goal, PartnershipMember } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GoalDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: goal } = await supabase.from("goals").select("*").eq("id", params.id).single();
  if (!goal) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let members: PartnershipMember[] = [];
  let inviteCode: string | null = null;

  if (goal.partnership_id) {
    const [{ data: partnership }, { data: mem }] = await Promise.all([
      supabase.from("partnerships").select("invite_code").eq("id", goal.partnership_id).single(),
      supabase
        .from("partnership_members")
        .select("*, profile:profiles(full_name)")
        .eq("partnership_id", goal.partnership_id),
    ]);
    inviteCode = partnership?.invite_code ?? null;
    members = (mem ?? []) as PartnershipMember[];
  }

  const pct = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);

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

        <h1 className="font-display text-2xl font-medium mb-1">{goal.name}</h1>
        <p className="text-sm text-ink-soft mb-6">
          {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)} ({pct}%)
        </p>

        <div className="h-2 rounded-full bg-hairline/10 overflow-hidden mb-10">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gold)" }} />
        </div>

        <PartnershipManager
          goal={goal as Goal}
          members={members}
          inviteCode={inviteCode}
          currentUserId={user!.id}
        />
      </main>
    </div>
  );
}
