import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { CalculatorsClient } from "@/components/CalculatorsClient";

export default function CalculatorsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-2xl">
        <Link
          href="/dashboard/investments"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-6 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <h1 className="font-display text-2xl font-medium mb-1">Calculadoras</h1>
        <p className="text-sm text-ink-soft mb-8">
          Respostas rápidas pras perguntas mais comuns sobre investimento.
        </p>

        <CalculatorsClient />
      </main>
    </div>
  );
}
