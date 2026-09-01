import Link from "next/link";
import type { Goal } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { motivationalPhrase } from "@/lib/motivationalPhrases";

export function GoalList({ goals }: { goals: Goal[] }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="text-[15.5px] font-bold">Metas</h3>
        <Link href="/dashboard/goals/new" className="text-xs font-semibold text-brand hover:underline">
          Nova meta
        </Link>
      </div>

      {goals.length === 0 && (
        <Link
          href="/dashboard/goals/new"
          className="flex items-center justify-between gap-3 rounded-card border border-dashed border-hairline px-4 py-3.5 text-sm text-ink-soft hover:text-ink transition-colors"
        >
          Nenhuma meta ainda — que tal criar a primeira?
        </Link>
      )}

      <div className="flex flex-col gap-4">
        {goals.map((g) => {
          const pct = Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100);
          const phrase = motivationalPhrase(pct, g.id);

          return (
            <div key={g.id} className="rounded-card overflow-hidden border border-hairline">
              {g.photo_url ? (
                <div
                  className="h-20 relative bg-cover bg-center"
                  style={{ backgroundImage: `url(${g.photo_url})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                    <span className="text-white text-sm font-semibold drop-shadow">{g.name}</span>
                    <span className="text-white font-display text-base drop-shadow" style={{ color: "#D3AE6E" }}>
                      {pct}%
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="h-2"
                  style={{ background: g.color }}
                />
              )}

              <div className="p-3.5">
                {!g.photo_url && (
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-[13.5px] font-semibold">{g.name}</span>
                    <span className="font-display text-[15px]" style={{ color: "var(--gold)" }}>
                      {pct}%
                    </span>
                  </div>
                )}
                <div className="h-1.5 rounded-full bg-hairline/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: "var(--gold)" }}
                  />
                </div>
                <div className="text-xs text-ink-faint mt-1.5">
                  {formatCurrency(g.current_amount)} de {formatCurrency(g.target_amount)}
                </div>
                <p className="text-xs italic text-ink-soft mt-2 leading-relaxed">{phrase}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
