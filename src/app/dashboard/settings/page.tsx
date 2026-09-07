import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { SettingsClient } from "@/components/SettingsClient";
import { PushNotificationToggle } from "@/components/PushNotificationToggle";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="flex min-h-screen">
      <Sidebar activeLabel="Configurações" />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-lg">
        <h1 className="font-display text-2xl font-medium mb-1">Configurações</h1>
        <p className="text-sm text-ink-soft mb-1">Sua conta, {user.email}.</p>
        {profile?.public_id && (
          <p className="text-xs text-ink-faint mb-8">
            Seu ID público: <code className="font-mono">#{profile.public_id}</code> — use isso
            (em vez do seu e-mail) pra alguém te convidar pra uma parceria ou família.
          </p>
        )}

        <div className="mb-10">
          <h3 className="text-[15.5px] font-bold mb-3">Notificações</h3>
          <p className="text-sm text-ink-soft mb-3">
            Avisa quando uma despesa estiver vencendo, mesmo com o app fechado.
          </p>
          <PushNotificationToggle />
        </div>

        <SettingsClient fullName={profile?.full_name ?? ""} />
      </main>
    </div>
  );
}
