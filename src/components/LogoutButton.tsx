"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    // Importante: não limpamos o "usuário lembrado" do localStorage aqui —
    // é justamente isso que permite a tela de boas-vindas personalizada
    // ("Olá, Fulano 👋") na próxima vez que a pessoa for entrar.
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      title="Sair"
      className="w-9 h-9 rounded-full border border-hairline bg-paper-raised flex items-center justify-center hover:bg-hairline/10 transition-colors"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-ink-soft" fill="none" strokeWidth="1.6">
        <path
          d="M15 17l5-5-5-5M20 12H9M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
