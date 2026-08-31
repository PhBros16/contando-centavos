"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("E-mail ou senha incorretos.");
      else router.push("/dashboard");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, household_name: householdName || "Minha família" },
        },
      });
      if (error) setError(error.message);
      else router.push("/dashboard");
    }

    setLoading(false);
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

        <h1 className="font-display text-2xl mb-1">
          {mode === "entrar" ? "Bem-vindo de volta" : "Comece sua jornada"}
        </h1>
        <p className="text-sm text-ink-soft mb-8">
          {mode === "entrar"
            ? "Entre para ver as finanças da família."
            : "Crie a conta principal da sua família no Contando Centavos."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "criar" && (
            <>
              <Field label="Seu nome" value={fullName} onChange={setFullName} required />
              <Field
                label="Nome da família"
                value={householdName}
                onChange={setHouseholdName}
                placeholder="ex: Família Rocha"
              />
            </>
          )}
          <Field label="E-mail" type="email" value={email} onChange={setEmail} required />
          <Field label="Senha" type="password" value={password} onChange={setPassword} required />

          {error && <p className="text-sm text-wine">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}
          className="mt-6 text-sm text-ink-soft hover:text-ink transition-colors"
        >
          {mode === "entrar" ? "Ainda não tem conta? Criar agora" : "Já tem conta? Entrar"}
        </button>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-ink-faint">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
      />
    </label>
  );
}
