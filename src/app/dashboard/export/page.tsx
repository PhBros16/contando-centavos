import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { ExcelExportClient } from "@/components/ExcelExportClient";

export default function ExportPage() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-6 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <h1 className="font-display text-2xl font-medium mb-1">Exportar</h1>
        <p className="text-sm text-ink-soft mb-9">Duas formas de tirar seus dados daqui.</p>

        <div className="rounded-card border border-hairline p-5 mb-6">
          <h3 className="text-[15.5px] font-bold mb-1">Planilha Excel detalhada</h3>
          <p className="text-sm text-ink-soft mb-5">
            Todas as transações do período, categorizadas, mais uma aba de resumo. Boa pra
            análise própria ou levar pro contador.
          </p>
          <ExcelExportClient defaultFrom={firstOfMonth} defaultTo={today} />
        </div>

        <div className="rounded-card border border-hairline p-5">
          <h3 className="text-[15.5px] font-bold mb-1">Relatório visual</h3>
          <p className="text-sm text-ink-soft mb-5">
            Uma versão estilizada e resumida — boa pra guardar em PDF ou compartilhar.
          </p>
          <Link
            href={`/dashboard/export/report?from=${firstOfMonth}&to=${today}`}
            className="inline-block px-4 py-2 rounded-lg bg-ink text-paper text-sm font-semibold hover:opacity-85 transition-opacity"
          >
            Ver relatório do mês
          </Link>
        </div>
      </main>
    </div>
  );
}
