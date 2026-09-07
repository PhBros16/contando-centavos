import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JoinFamilyClient } from "@/components/JoinFamilyClient";

export const dynamic = "force-dynamic";

export default async function JoinFamilyPage({ params }: { params: { code: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/join-family/${params.code}`);

  const { data: family } = await supabase
    .from("families")
    .select("id, name")
    .eq("invite_code", params.code)
    .single();

  if (!family) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-paper">
        <p className="text-sm text-ink-soft">Convite não encontrado ou expirado.</p>
      </main>
    );
  }

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

        <h1 className="font-display text-2xl mb-1">Convite pra família</h1>
        <p className="text-sm text-ink-soft mb-8">
          Você foi convidado a entrar na <strong>{family.name}</strong>. Suas contas, transações,
          orçamento e metas passam a ser compartilhados com os outros membros.
        </p>

        <JoinFamilyClient familyId={family.id} />
      </div>
    </main>
  );
}
