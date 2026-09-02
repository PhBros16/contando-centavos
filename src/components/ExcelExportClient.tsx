"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";

export function ExcelExportClient({ defaultFrom, defaultTo }: { defaultFrom: string; defaultTo: string }) {
  const supabase = createClient();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [generating, setGenerating] = useState(false);

  async function handleExport() {
    setGenerating(true);

    const [{ data: transactions }, { data: accounts }] = await Promise.all([
      supabase
        .from("transactions")
        .select("occurred_at, description, amount, account_id, category:categories(name, kind)")
        .gte("occurred_at", from)
        .lte("occurred_at", to)
        .order("occurred_at"),
      supabase.from("accounts").select("id, name"),
    ]);

    const accountNames = Object.fromEntries((accounts ?? []).map((a) => [a.id, a.name]));

    type Row = {
      occurred_at: string;
      description: string;
      amount: number;
      account_id: string;
      category: { name: string; kind: string } | { name: string; kind: string }[] | null;
    };

    const rows = (transactions ?? []) as unknown as Row[];

    // ---- Aba 1: Transações detalhadas ----
    const transactionSheet = rows.map((t) => {
      const cat = Array.isArray(t.category) ? t.category[0] : t.category;
      return {
        Data: new Date(t.occurred_at + "T00:00:00").toLocaleDateString("pt-BR"),
        Descrição: t.description,
        Categoria: cat?.name ?? "Sem categoria",
        Tipo: t.amount > 0 ? "Receita" : "Despesa",
        Conta: accountNames[t.account_id] ?? "—",
        Valor: Number(t.amount),
      };
    });

    // ---- Aba 2: Resumo por categoria ----
    const totalsByCategory: Record<string, number> = {};
    for (const t of rows) {
      const cat = Array.isArray(t.category) ? t.category[0] : t.category;
      const name = cat?.name ?? "Sem categoria";
      totalsByCategory[name] = (totalsByCategory[name] ?? 0) + Number(t.amount);
    }
    const summarySheet = Object.entries(totalsByCategory)
      .sort((a, b) => a[1] - b[1])
      .map(([categoria, total]) => ({ Categoria: categoria, Total: total }));

    const totalReceitas = rows.filter((t) => t.amount > 0).reduce((s, t) => s + Number(t.amount), 0);
    const totalDespesas = rows.filter((t) => t.amount < 0).reduce((s, t) => s + Number(t.amount), 0);
    summarySheet.push(
      { Categoria: "", Total: NaN },
      { Categoria: "Total receitas", Total: totalReceitas },
      { Categoria: "Total despesas", Total: totalDespesas },
      { Categoria: "Saldo do período", Total: totalReceitas + totalDespesas }
    );

    const workbook = XLSX.utils.book_new();
    const wsTransactions = XLSX.utils.json_to_sheet(transactionSheet);
    wsTransactions["!cols"] = [{ wch: 12 }, { wch: 32 }, { wch: 18 }, { wch: 10 }, { wch: 18 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(workbook, wsTransactions, "Transações");

    const wsSummary = XLSX.utils.json_to_sheet(summarySheet, { skipHeader: false });
    wsSummary["!cols"] = [{ wch: 24 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(workbook, wsSummary, "Resumo");

    const periodLabel = `${from}_a_${to}`;
    XLSX.writeFile(workbook, `contando-centavos_${periodLabel}.xlsx`);

    setGenerating(false);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink-faint">De</span>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-hairline bg-paper-raised px-2.5 py-2 text-sm outline-none focus:border-brand"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink-faint">Até</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-hairline bg-paper-raised px-2.5 py-2 text-sm outline-none focus:border-brand"
        />
      </label>
      <button
        onClick={handleExport}
        disabled={generating}
        className="px-4 py-2 rounded-lg bg-brand text-paper-raised text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {generating ? "Gerando…" : "Baixar Excel"}
      </button>
    </div>
  );
}
