"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "cc_remembered_user";

type RememberedUser = { name: string; email: string };

// Nunca esconder o erro de verdade atrás de uma mensagem genérica — isso foi
// exatamente o que causou um bug grave: um e-mail não confirmado aparecia
// como "senha incorreta", deixando a pessoa travada sem entender por quê.
function translateAuthError(message: string): string {
  const known: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "Email not confirmed":
      "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada (e o spam) e clique no link de confirmação antes de entrar.",
  };
  return known[message] ?? message;
}

function saveRememberedUser(user: RememberedUser) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // localStorage pode falhar em modo privado — não é crítico, só perde a
    // conveniência da tela de reconhecimento na próxima visita.
  }
}

function readRememberedUser(): RememberedUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [remembered, setRemembered] = useState<RememberedUser | null | undefined>(undefined);
  const [showFullForm, setShowFullForm] = useState(false);

  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [quickPassword, setQuickPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // undefined = ainda não checou; null = checou e não tem ninguém lembrado
    setRemembered(readRememberedUser());
  }, []);

  async function rememberCurrentUser(userId: string, emailUsed: string, fallbackName?: string) {
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
    saveRememberedUser({ name: profile?.full_name ?? fallbackName ?? "por aqui", email: emailUsed });
  }

  async function handleQuickSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!remembered) return;
    setError(null);
    setInfo(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: remembered.email,
      password: quickPassword,
    });

    setLoading(false);
    if (error) setError(translateAuthError(error.message));
    else router.push("/dashboard");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "entrar") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translateAuthError(error.message));
      } else if (data.user) {
        await rememberCurrentUser(data.user.id, email);
        router.push("/dashboard");
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, household_name: `Espaço de ${fullName || "usuário"}` },
        },
      });

      if (error) {
        setError(translateAuthError(error.message));
      } else if (!data.session) {
        // Conta criada, mas o Supabase exige confirmação por e-mail antes de
        // liberar uma sessão de verdade — sem isso, empurrar pro /dashboard
        // só faria a pessoa ser jogada de volta pro login, confusa.
        saveRememberedUser({ name: fullName, email });
        setInfo("Conta criada! Verifique seu e-mail e clique no link de confirmação antes de entrar.");
      } else {
        saveRememberedUser({ name: fullName, email });
        router.push("/dashboard");
      }
    }

    setLoading(false);
  }

  async function handleDemoLogin() {
    setError(null);
    setInfo(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: "demo@contandocentavos.app",
      password: "DemoContandoCentavos2026",
    });

    setLoading(false);
    if (error) setError(translateAuthError(error.message));
    else router.push("/dashboard");
  }

  // Evita "piscar" a tela errada enquanto ainda não sabemos se há alguém lembrado
  if (remembered === undefined) {
    return <main className="min-h-screen bg-paper" />;
  }

  if (remembered && !showFullForm) {
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
            Olá, {remembered.name.split(" ")[0]} 👋 Bem-vindo de volta
          </h1>
          <p className="text-sm text-ink-soft mb-8">Para entrar, digite sua senha.</p>

          <form onSubmit={handleQuickSubmit} className="flex flex-col gap-4">
            <Field label="Senha" type="password" value={quickPassword} onChange={setQuickPassword} required />

            {error && <p className="text-sm text-wine">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <Link href="/forgot-password" className="mt-4 block text-xs text-ink-faint hover:text-ink transition-colors">
            Esqueceu a senha?
          </Link>

          <button
            onClick={() => setShowFullForm(true)}
            className="mt-6 text-sm text-ink-soft hover:text-ink transition-colors"
          >
            Não é você? Entrar com outro e-mail
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-paper relative">
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
        <p className="text-sm text-ink-soft mb-6">
          {mode === "entrar" ? "Entre para ver suas finanças." : "Crie sua conta no Contando Centavos."}
        </p>

        <div className="flex rounded-lg border border-hairline overflow-hidden mb-6">
          <button
            type="button"
            onClick={() => setMode("entrar")}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              mode === "entrar" ? "bg-brand text-paper-raised" : "text-ink-soft hover:text-ink"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("criar")}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              mode === "criar" ? "bg-brand text-paper-raised" : "text-ink-soft hover:text-ink"
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "criar" && <Field label="Seu nome" value={fullName} onChange={setFullName} required />}
          <Field label="E-mail" type="email" value={email} onChange={setEmail} required />
          <Field label="Senha" type="password" value={password} onChange={setPassword} required />

          {error && <p className="text-sm text-wine">{error}</p>}
          {info && <p className="text-sm text-brand">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="mt-4 w-full border border-dashed border-hairline rounded-lg py-2.5 text-sm font-semibold text-ink-soft hover:text-ink hover:border-brand/40 transition-colors disabled:opacity-60"
        >
          Ver demo (dados de exemplo)
        </button>
        <p className="text-[11px] text-ink-faint mt-1.5 text-center">
          Conta compartilhada só pra explorar o app — não use dados reais aqui.
        </p>

        {mode === "entrar" && (
          <Link href="/forgot-password" className="mt-4 block text-xs text-ink-faint hover:text-ink transition-colors">
            Esqueceu a senha?
          </Link>
        )}

        {remembered && (
          <button
            onClick={() => setShowFullForm(false)}
            className="mt-6 text-sm text-ink-soft hover:text-ink transition-colors"
          >
            ← Voltar
          </button>
        )}
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
