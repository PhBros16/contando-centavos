"use client";

import { useState } from "react";

export function GuideAccordion({ sections }: { sections: { title: string; body: string }[] }) {
  const [openTitle, setOpenTitle] = useState<string | null>(null);

  return (
    <div>
      {sections.map((s) => {
        const isOpen = openTitle === s.title;
        return (
          <div key={s.title} className="border-b border-hairline last:border-none">
            <button
              onClick={() => setOpenTitle(isOpen ? null : s.title)}
              className="w-full flex items-center justify-between gap-3 py-4 text-left"
            >
              <span className="text-[15px] font-bold">{s.title}</span>
              <svg
                viewBox="0 0 24 24"
                className={`w-4 h-4 shrink-0 text-ink-faint transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path d="M6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isOpen && <p className="text-sm text-ink-soft leading-relaxed pb-4 pr-6">{s.body}</p>}
          </div>
        );
      })}
    </div>
  );
}
