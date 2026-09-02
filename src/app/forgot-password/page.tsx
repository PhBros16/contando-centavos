"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
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

        {sent ? (
          <>
            <h1 className="font-display text-2xl mb-1">Verifique seu e-mail</h1>
            <p className="text-sm text-ink-soft mb-8">
              Se <strong>{email}</strong> tiver uma conta aqui, enviamos um link pra você criar uma
              nova senha.
            </p>
            <Link href="/login" className="text-sm font-semibold text-brand hover:underline">
              ← Voltar para o login
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl mb-1">Esqueceu a senha?</h1>
            <p className="text-sm text-ink-soft mb-8">
              Digite seu e-mail e mandamos um link pra você redefinir.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-faint">E-mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
                />
              </label>

              {error && <p className="text-sm text-wine">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loading ? "Enviando…" : "Enviar link de recuperação"}
              </button>
            </form>

            <Link href="/login" className="mt-6 inline-block text-sm text-ink-soft hover:text-ink transition-colors">
              ← Voltar para o login
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
