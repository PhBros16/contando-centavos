import { createClient } from "jsr:@supabase/supabase-js@2";

// Exclui a conta do usuário por completo: a household (que em cascata
// derruba accounts, transactions, categories, budgets, goals, bills,
// investments, recurring_rules...) e depois o próprio usuário no Auth.
//
// Deploy: supabase functions deploy delete-account
// (ou via MCP/dashboard do Supabase, como foi feito neste projeto)
Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
    }

    // Cliente com a service_role key — só existe no ambiente da Edge Function,
    // nunca é exposto ao navegador.
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await adminClient
      .from("profiles")
      .select("household_id")
      .eq("id", user.id)
      .single();

    if (profile?.household_id) {
      await adminClient.from("households").delete().eq("id", profile.household_id);
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
