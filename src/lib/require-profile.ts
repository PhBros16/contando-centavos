import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Busca o usuário logado e seu profile (household_id). Se a sessão estiver
 * momentaneamente inválida (ex: token expirando, prefetch antes da sessão
 * hidratar) em vez de deixar a página quebrar com "Cannot read properties
 * of null" manda a pessoa pra tela de login, que já resolve sozinho na
 * próxima tentativa.
 */
export async function requireProfile(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return { user, profile };
}
