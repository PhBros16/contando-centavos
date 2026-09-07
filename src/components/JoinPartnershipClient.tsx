"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function JoinPartnershipClient({
  partnershipId,
  alreadyMember,
}: {
  partnershipId: string;
  alreadyMember: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("partnership_members").insert({
      partnership_id: partnershipId,
      profile_id: user!.id,
      contribution_target: parseFloat(target.replace(",", ".")) || 0,
    });

    setSaving(false);
    if (error) setError(error.message);
    else router.push("/dashboard");
  }

  if (alreadyMember) {
    return (
      <div>
        <p className="text-sm text-brand font-semibold mb-4">Você já faz parte dessa parceria.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-brand text-paper-raised rounded-lg py-2.5 px-5 text-sm font-semibold hover:opacity-90"
        >
          Ir para o painel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink-faint">Sua meta de contribuição</span>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          inputMode="decimal"
          placeholder="R$ 0,00"
          className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand"
        />
      </label>
      {error && <p className="text-sm text-wine">{error}</p>}
      <button
        onClick={handleJoin}
        disabled={saving}
        className="bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Entrando…" : "Entrar na parceria"}
      </button>
    </div>
  );
}
