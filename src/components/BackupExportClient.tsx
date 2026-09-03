"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TABLES = [
  "accounts",
  "categories",
  "transactions",
  "budgets",
  "goals",
  "bills",
  "recurring_rules",
  "investments",
  "investment_operations",
] as const;

export function BackupExportClient() {
  const supabase = createClient();
  const [generating, setGenerating] = useState(false);

  async function handleBackup() {
    setGenerating(true);

    const results = await Promise.all(TABLES.map((table) => supabase.from(table).select("*")));

    const backup: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      app: "Contando Centavos",
    };
    TABLES.forEach((table, i) => {
      backup[table] = results[i].data ?? [];
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contando-centavos_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setGenerating(false);
  }

  return (
    <button
      onClick={handleBackup}
      disabled={generating}
      className="px-4 py-2 rounded-lg bg-ink text-paper text-sm font-semibold hover:opacity-85 transition-opacity disabled:opacity-60"
    >
      {generating ? "Gerando…" : "Baixar backup completo (.json)"}
    </button>
  );
}
