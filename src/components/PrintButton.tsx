"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 rounded-lg bg-brand text-paper-raised text-sm font-semibold hover:opacity-90 transition-opacity"
    >
      Imprimir / Salvar PDF
    </button>
  );
}
