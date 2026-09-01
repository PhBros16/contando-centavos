import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Roda a cada carregamento do dashboard: verifica recorrências ativas cuja
 * próxima ocorrência já chegou (ou passou, se a pessoa ficou um tempo sem
 * abrir o app) e gera as transações de verdade, avançando a data da próxima
 * ocorrência. Limitado a 24 iterações por regra pra nunca travar caso algo
 * fique "atrasado" por muito tempo.
 */
export async function processDueRecurringRules(supabase: SupabaseClient): Promise<void> {
  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: dueRules } = await supabase
    .from("recurring_rules")
    .select("*")
    .eq("active", true)
    .lte("next_occurrence", todayStr);

  if (!dueRules || dueRules.length === 0) return;

  for (const rule of dueRules) {
    let nextDate = rule.next_occurrence as string;
    let iterations = 0;

    while (nextDate <= todayStr && iterations < 24) {
      await supabase.from("transactions").insert({
        household_id: rule.household_id,
        account_id: rule.account_id,
        category_id: rule.category_id,
        recurring_rule_id: rule.id,
        description: rule.description,
        amount: rule.amount,
        occurred_at: nextDate,
      });

      nextDate = addInterval(nextDate, rule.frequency);
      iterations++;
    }

    await supabase.from("recurring_rules").update({ next_occurrence: nextDate }).eq("id", rule.id);
  }
}

function addInterval(dateStr: string, frequency: "semanal" | "mensal" | "anual"): string {
  const date = new Date(dateStr + "T00:00:00");
  if (frequency === "semanal") date.setDate(date.getDate() + 7);
  else if (frequency === "mensal") date.setMonth(date.getMonth() + 1);
  else date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}
