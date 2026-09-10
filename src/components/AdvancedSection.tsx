"use client";

import { useState } from "react";

export function AdvancedSection({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 py-3 text-sm font-semibold text-ink-soft hover:text-ink transition-colors"
      >
        <span>{open ? "Ocultar análises avançadas" : "Ver análises avançadas"}</span>
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path d="M6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="flex flex-col gap-10 pt-4">{children}</div>}
    </div>
  );
}
