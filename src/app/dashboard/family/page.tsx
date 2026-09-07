import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { FamilyManager } from "@/components/FamilyManager";
import type { FamilyMember } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FamilyPage() {
  const supabase = createClient();

  const { data: myMemberships } = await supabase
    .from("family_members")
    .select("*, family:families(name, invite_code)")
    .limit(1);

  const myMembership = myMemberships?.[0] ?? null;

  let members: FamilyMember[] = [];
  if (myMembership) {
    const { data } = await supabase
      .from("family_members")
      .select("*, household:households(name)")
      .eq("family_id", myMembership.family_id);
    members = (data ?? []) as FamilyMember[];
  }

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

        <h1 className="font-display text-2xl font-medium mb-1">Família</h1>
        <p className="text-sm text-ink-soft mb-8">
          Um espaço amplo e opcional — famílias compartilham contas, transações, orçamento e
          metas continuamente, diferente de uma parceria (que é só um objetivo pontual).
        </p>

        <FamilyManager
          existingFamily={
            myMembership
              ? {
                  name: (myMembership.family as unknown as { name: string }).name,
                  inviteCode: (myMembership.family as unknown as { invite_code: string }).invite_code,
                }
              : null
          }
          members={members}
        />
      </main>
    </div>
  );
}
