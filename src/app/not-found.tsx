import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-paper">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-[9px] bg-brand flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-paper-raised" fill="none" strokeWidth="1.8">
              <path d="M4 18 L10 10 L14 14 L20 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display text-xl">Contando Centavos</span>
        </div>

        <div className="font-display text-6xl mb-3" style={{ color: "var(--gold)" }}>
          404
        </div>
        <h1 className="font-display text-xl mb-2">Essa página saiu do orçamento</h1>
        <p className="text-sm text-ink-soft mb-8">
          Não encontramos o que você procurava. Deve ter sido gasto em outra categoria.
        </p>

        <Link
          href="/dashboard"
          className="inline-block bg-brand text-paper-raised rounded-lg py-2.5 px-5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Voltar pro painel
        </Link>
      </div>
    </main>
  );
}
