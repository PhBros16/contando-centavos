"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/client";
import type { Account } from "@/lib/types";

type ParsedRow = { data: string; descricao: string; valor: string };

function parseDate(raw: string): string | null {
  const trimmed = raw.trim();
  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // dd/mm/yyyy
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return null;
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/\./g, "").replace(",", ".");
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

export default function ImportPage() {
  const router = useRouter();
  const supabase = createClient();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  useEffect(() => {
    supabase
      .from("accounts")
      .select("*")
      .eq("archived", false)
      .then(({ data }) => {
        setAccounts((data ?? []) as Account[]);
        if (data && data.length > 0) setAccountId(data[0].id);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    setResult(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const normalized = results.data.map((row) => {
          const lower = Object.fromEntries(
            Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), v])
          );
          return {
            data: lower["data"] ?? lower["date"] ?? "",
            descricao: lower["descricao"] ?? lower["descrição"] ?? lower["description"] ?? "",
            valor: lower["valor"] ?? lower["amount"] ?? lower["value"] ?? "",
          };
        });

        if (normalized.length === 0 || !normalized[0].data) {
          setFileError(
            'Não encontrei as colunas esperadas. O CSV precisa ter um cabeçalho com "data", "descricao" e "valor".'
          );
          setRows([]);
          return;
        }

        setRows(normalized);
      },
      error: () => setFileError("Não consegui ler esse arquivo."),
    });
  }

  async function handleImport() {
    if (!accountId) return;
    setSaving(true);

    let imported = 0;
    let skipped = 0;
    const toInsert = [];

    for (const row of rows) {
      const date = parseDate(row.data);
      const amount = parseAmount(row.valor);
      if (!date || amount === null || !row.descricao) {
        skipped++;
        continue;
      }
      toInsert.push({
        account_id: accountId,
        description: row.descricao.trim(),
        amount,
        occurred_at: date,
      });
      imported++;
    }

    if (toInsert.length > 0) {
      await supabase.from("transactions").insert(toInsert);
    }

    setSaving(false);
    setResult({ imported, skipped });
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10 flex justify-center">
      <div className="w-full max-w-lg">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-8 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <h1 className="font-display text-2xl font-medium mb-1">Importar extrato (CSV)</h1>
        <p className="text-sm text-ink-soft mb-2">
          O arquivo precisa ter um cabeçalho com as colunas <strong>data</strong>,{" "}
          <strong>descricao</strong> e <strong>valor</strong>.
        </p>
        <p className="text-xs text-ink-faint mb-8">
          Datas em dd/mm/aaaa ou aaaa-mm-dd. Valores negativos são despesas, positivos são
          receitas. Categoria não vem no CSV — categorize depois na lista de transações.
        </p>

        {accounts.length === 0 ? (
          <p className="text-sm text-ink-faint">
            Cadastre uma conta primeiro em{" "}
            <Link href="/dashboard/accounts/new" className="text-brand font-semibold hover:underline">
              Contas
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-faint">Importar para a conta</span>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-faint">Arquivo CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-ink file:text-paper file:text-xs file:font-bold"
              />
            </label>

            {fileError && <p className="text-sm text-wine">{fileError}</p>}

            {rows.length > 0 && !result && (
              <div>
                <p className="text-sm text-ink-soft mb-3">
                  {rows.length} linhas encontradas. Prévia das 5 primeiras:
                </p>
                <div className="rounded-card border border-hairline overflow-hidden mb-4">
                  {rows.slice(0, 5).map((r, i) => (
                    <div
                      key={i}
                      className="flex justify-between gap-3 px-3 py-2 text-xs border-b border-hairline last:border-none"
                    >
                      <span className="text-ink-faint shrink-0">{r.data}</span>
                      <span className="flex-1 truncate">{r.descricao}</span>
                      <span className="font-display shrink-0">{r.valor}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleImport}
                  disabled={saving}
                  className="w-full bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {saving ? "Importando…" : `Importar ${rows.length} transações`}
                </button>
              </div>
            )}

            {result && (
              <div className="rounded-card border border-hairline p-4 text-sm">
                <p className="font-semibold mb-1">
                  {result.imported} transações importadas
                  {result.skipped > 0 && `, ${result.skipped} ignoradas (formato inválido)`}.
                </p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-brand font-semibold hover:underline mt-2"
                >
                  Ver no painel →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
