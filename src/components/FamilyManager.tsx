"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { FamilyMember } from "@/lib/types";

export function FamilyManager({
  existingFamily,
  members,
}: {
  existingFamily: { name: string; inviteCode: string } | null;
  members: FamilyMember[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [familyName, setFamilyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setSaving(true);
    setError(null);

    const { data: family, error: createError } = await supabase
      .from("families")
      .insert({ name: familyName || "Minha família" })
      .select()
      .single();

    if (createError || !family) {
      setError(createError?.message ?? "Erro ao criar família.");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user!.id)
      .single();

    await supabase
      .from("family_members")
      .insert({ family_id: family.id, household_id: profile!.household_id });

    setSaving(false);
    router.refresh();
  }

  async function handleJoin() {
    setSaving(true);
    setError(null);

    const { data: family } = await supabase
      .from("families")
      .select("id")
      .eq("invite_code", joinCode.trim())
      .maybeSingle();

    if (!family) {
      setError("Código não encontrado.");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user!.id)
      .single();

    const { error: joinError } = await supabase
      .from("family_members")
      .insert({ family_id: family.id, household_id: profile!.household_id });

    setSaving(false);
    if (joinError) setError(joinError.message);
    else router.refresh();
  }

  function copyInviteLink() {
    if (!existingFamily) return;
    navigator.clipboard.writeText(`${window.location.origin}/join-family/${existingFamily.inviteCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (existingFamily) {
    return (
      <div className="rounded-card border border-hairline p-5">
        <h3 className="text-[15.5px] font-bold mb-4">{existingFamily.name}</h3>
        <div className="flex flex-col gap-2 mb-5">
          {members.map((m) => (
            <div key={m.id} className="text-sm">
              {m.household?.name ?? "Household"}
            </div>
          ))}
        </div>
        <button onClick={copyInviteLink} className="text-sm font-semibold text-brand hover:underline">
          {copied ? "Link copiado ✓" : "Copiar link de convite"}
        </button>
        <p className="text-xs text-ink-faint mt-4 leading-relaxed">
          A partir de agora, contas, transações, orçamento e metas de todos os membros aparecem
          juntos nas suas telas.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card border border-hairline p-5">
        <h3 className="text-[15.5px] font-bold mb-3">Criar uma família</h3>
        <div className="flex gap-2">
          <input
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="ex: Família Silva"
            className="flex-1 rounded-lg border border-hairline bg-paper-raised px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-brand text-paper-raised text-sm font-semibold disabled:opacity-60"
          >
            Criar
          </button>
        </div>
      </div>

      <div className="rounded-card border border-hairline p-5">
        <h3 className="text-[15.5px] font-bold mb-3">Entrar com um código</h3>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Código de convite"
            className="flex-1 rounded-lg border border-hairline bg-paper-raised px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            onClick={handleJoin}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-ink text-paper text-sm font-semibold disabled:opacity-60"
          >
            Entrar
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-wine">{error}</p>}
    </div>
  );
}
