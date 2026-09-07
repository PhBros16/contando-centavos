import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JoinPartnershipClient } from "@/components/JoinPartnershipClient";

export const dynamic = "force-dynamic";

export default async function JoinPartnershipPage({ params }: { params: { code: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/join-partnership/${params.code}`);

  const { data: partnership } = await supabase
    .from("partnerships")
    .select("id, invite_code")
    .eq("invite_code", params.code)
    .single();

  if (!partnership) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-paper">
        <p className="text-sm text-ink-soft">Convite não encontrado ou expirado.</p>
      </main>
    );
  }

  const { data: goal } = await supabase
    .from("goals")
    .select("name, target_amount")
    .eq("partnership_id", partnership.id)
    .single();

  const { data: existingMembership } = await supabase
    .from("partnership_members")
    .select("id")
    .eq("partnership_id", partnership.id)
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-paper">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-[9px] bg-brand flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-paper-raised" fill="none" strokeWidth="1.8">
              <path d="M4 18 L10 10 L14 14 L20 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display text-xl">Contando Centavos</span>
        </div>

        <h1 className="font-display text-2xl mb-1">Convite pra parceria</h1>
        <p className="text-sm text-ink-soft mb-8">
          Você foi convidado a contribuir pra <strong>{goal?.name ?? "um objetivo"}</strong>.
        </p>

        <JoinPartnershipClient
          partnershipId={partnership.id}
          alreadyMember={!!existingMembership}
        />
      </div>
    </main>
  );
}
