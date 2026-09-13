"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function JoinFamilyClient({ familyId }: { familyId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("Sua sessão expirou. Recarregue a página e faça login de novo.");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user.id)
      .single();
    if (!profile) {
      setSaving(false);
      setError("Não achamos seu perfil. Recarregue a página e tente de novo.");
      return;
    }

    const { error: joinError } = await supabase
      .from("family_members")
      .insert({ family_id: familyId, household_id: profile.household_id });

    setSaving(false);
    if (joinError) setError(joinError.message);
    else router.push("/dashboard/family");
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-wine">{error}</p>}
      <button
        onClick={handleJoin}
        disabled={saving}
        className="bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Entrando…" : "Entrar na família"}
      </button>
    </div>
  );
}
