"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

const SUGGESTED_COLORS = [
  "#2F5D50",
  "#B08A42",
  "#8B3A48",
  "#4A6FA5",
  "#7C6E92",
  "#3E7C7C",
  "#A6763D",
  "#5C6B73",
];

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [kind, setKind] = useState<"receita" | "despesa">("despesa");
  const [color, setColor] = useState(SUGGESTED_COLORS[0]);
  const [icon, setIcon] = useState("🏷️");
  const [saving, setSaving] = useState(false);

  const despesas = initialCategories.filter((c) => c.kind === "despesa");
  const receitas = initialCategories.filter((c) => c.kind === "receita");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user!.id)
      .single();

    await supabase.from("categories").insert({
      household_id: profile!.household_id,
      name: name.trim(),
      kind,
      color,
      icon,
    });

    setName("");
    setSaving(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("categories").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-9">
      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-4 rounded-card border border-hairline bg-paper-raised p-5"
      >
        <span className="text-xs font-semibold text-ink-faint">Nova categoria</span>

        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Nome (ex: Pet, Viagens...)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-[160px] rounded-lg border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-brand transition-colors"
          />
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            maxLength={2}
            className="w-14 text-center rounded-lg border border-hairline bg-paper px-2 py-2 text-lg outline-none focus:border-brand transition-colors"
            title="Emoji da categoria"
          />
          <div className="flex rounded-lg overflow-hidden border border-hairline shrink-0">
            <button
              type="button"
              onClick={() => setKind("despesa")}
              className={`px-3 py-2 text-xs font-bold transition-colors ${
                kind === "despesa" ? "bg-wine text-paper-raised" : "text-ink-soft"
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setKind("receita")}
              className={`px-3 py-2 text-xs font-bold transition-colors ${
                kind === "receita" ? "bg-brand text-paper-raised" : "text-ink-soft"
              }`}
            >
              Receita
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-faint mr-1">Cor:</span>
          {SUGGESTED_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full transition-transform ${
                color === c ? "ring-2 ring-offset-2 ring-offset-paper-raised ring-ink scale-110" : ""
              }`}
              style={{ background: c }}
            />
          ))}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto px-4 py-1.5 rounded-lg bg-ink text-paper text-xs font-bold hover:opacity-85 transition-opacity disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Adicionar"}
          </button>
        </div>
      </form>

      <CategoryGroup title="Despesas" categories={despesas} onDelete={handleDelete} />
      <CategoryGroup title="Receitas" categories={receitas} onDelete={handleDelete} />
    </div>
  );
}

function CategoryGroup({
  title,
  categories,
  onDelete,
}: {
  title: string;
  categories: Category[];
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="text-[15.5px] font-bold mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="group flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-full border border-hairline text-sm"
            style={{ background: `${c.color}14` }}
          >
            <span>{c.icon}</span>
            <span className="font-medium">{c.name}</span>
            <button
              onClick={() => onDelete(c.id)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-ink-faint opacity-0 group-hover:opacity-100 hover:bg-hairline/20 transition-opacity"
              title="Remover categoria"
            >
              ×
            </button>
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-ink-faint">Nenhuma categoria ainda.</p>}
      </div>
    </div>
  );
}
