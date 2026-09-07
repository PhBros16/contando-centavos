"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Goal, PartnershipMember } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function PartnershipManager({
  goal,
  members,
  inviteCode,
  currentUserId,
}: {
  goal: Goal;
  members: PartnershipMember[];
  inviteCode: string | null;
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [myTarget, setMyTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [contributionInput, setContributionInput] = useState("");
  const [copied, setCopied] = useState(false);

  const myMembership = members.find((m) => m.profile_id === currentUserId);

  async function handleCreatePartnership() {
    setSaving(true);
    const { data: partnership } = await supabase
      .from("partnerships")
      .insert({ created_by: currentUserId })
      .select()
      .single();

    if (partnership) {
      await supabase.from("partnership_members").insert({
        partnership_id: partnership.id,
        profile_id: currentUserId,
        contribution_target: parseFloat(myTarget.replace(",", ".")) || 0,
      });
      await supabase.from("goals").update({ partnership_id: partnership.id }).eq("id", goal.id);
    }

    setSaving(false);
    router.refresh();
  }

  async function handleAddContribution() {
    if (!myMembership) return;
    setSaving(true);
    const addAmount = parseFloat(contributionInput.replace(",", ".")) || 0;

    await supabase
      .from("partnership_members")
      .update({ contributed_amount: myMembership.contributed_amount + addAmount })
      .eq("id", myMembership.id);

    // Mantém o valor total da meta em sincronia com a soma de todos os aportes
    const newTotal = members.reduce(
      (sum, m) => sum + (m.id === myMembership.id ? m.contributed_amount + addAmount : m.contributed_amount),
      0
    );
    await supabase.from("goals").update({ current_amount: newTotal }).eq("id", goal.id);

    setContributionInput("");
    setSaving(false);
    router.refresh();
  }

  function copyInviteLink() {
    const url = `${window.location.origin}/join-partnership/${inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!goal.partnership_id) {
    return (
      <div className="rounded-card border border-hairline p-5">
        <h3 className="text-[15.5px] font-bold mb-1">Parceria</h3>
        <p className="text-sm text-ink-soft mb-4">
          Convide alguém pra dividir esse objetivo com você — cada um com sua própria meta de
          contribuição.
        </p>
        <label className="flex flex-col gap-1.5 mb-4 max-w-xs">
          <span className="text-xs font-semibold text-ink-faint">Sua meta de contribuição</span>
          <input
            value={myTarget}
            onChange={(e) => setMyTarget(e.target.value)}
            inputMode="decimal"
            placeholder="R$ 0,00"
            className="rounded-lg border border-hairline bg-paper-raised px-3 py-2 text-sm font-display outline-none focus:border-brand"
          />
        </label>
        <button
          onClick={handleCreatePartnership}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-brand text-paper-raised text-sm font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Criando…" : "Transformar em parceria"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-hairline p-5">
      <h3 className="text-[15.5px] font-bold mb-1">Parceria</h3>
      <p className="text-sm text-ink-soft mb-4">
        {members.length} pessoa{members.length !== 1 ? "s" : ""} contribuindo pra esse objetivo.
      </p>

      <div className="flex flex-col gap-3 mb-5">
        {members.map((m) => (
          <div key={m.id} className="flex justify-between items-baseline text-sm">
            <span className="font-medium">
              {m.profile?.full_name ?? "Membro"} {m.profile_id === currentUserId && "(você)"}
            </span>
            <span className="text-ink-faint">
              {formatCurrency(m.contributed_amount)} de {formatCurrency(m.contribution_target)}
            </span>
          </div>
        ))}
      </div>

      {myMembership && (
        <div className="flex gap-2 mb-5">
          <input
            value={contributionInput}
            onChange={(e) => setContributionInput(e.target.value)}
            inputMode="decimal"
            placeholder="Registrar novo aporte"
            className="flex-1 rounded-lg border border-hairline bg-paper-raised px-3 py-2 text-sm font-display outline-none focus:border-brand"
          />
          <button
            onClick={handleAddContribution}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-ink text-paper text-sm font-semibold disabled:opacity-60"
          >
            Adicionar
          </button>
        </div>
      )}

      {inviteCode && (
        <div className="pt-4 border-t border-hairline">
          <span className="text-xs font-semibold text-ink-faint block mb-2">Convidar mais alguém</span>
          <button
            onClick={copyInviteLink}
            className="text-sm font-semibold text-brand hover:underline"
          >
            {copied ? "Link copiado ✓" : "Copiar link de convite"}
          </button>
        </div>
      )}
    </div>
  );
}
