"use client";

const NAV_ITEMS = [
  { label: "Visão geral", icon: "home" },
  { label: "Transações", icon: "list" },
  { label: "Despesas", icon: "bill" },
  { label: "Orçamento", icon: "budget" },
  { label: "Metas", icon: "goal" },
  { label: "Investimentos", icon: "trend" },
  { label: "Previsões", icon: "forecast" },
];

const ICONS: Record<string, React.ReactNode> = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  list: <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />,
  bill: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6" strokeLinecap="round" />
    </>
  ),
  budget: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M3.5 10h17" />
    </>
  ),
  goal: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
  trend: <path d="M4 16 9 9l4 4 7-9" strokeLinecap="round" strokeLinejoin="round" />,
  forecast: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4.5" />
    </>
  ),
};

export function Sidebar({ activeLabel = "Visão geral" }: { activeLabel?: string }) {
  return (
    <>
      {/* Desktop: coluna fixa à esquerda */}
      <aside className="hidden md:flex w-[232px] shrink-0 flex-col border-r border-hairline px-5 py-7">
        <Brand />
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.label} {...item} active={item.label === activeLabel} />
          ))}
        </nav>
      </aside>

      {/* Mobile: barra fixa inferior com ícones */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t border-hairline bg-paper-raised px-1 py-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] ${
              item.label === activeLabel ? "text-brand" : "text-ink-faint"
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" strokeWidth="1.6" stroke="currentColor">
              {ICONS[item.icon]}
            </svg>
            {item.label.split(" ")[0]}
          </button>
        ))}
      </nav>
    </>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2 pb-7">
      <div className="w-[30px] h-[30px] rounded-[9px] bg-brand flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-paper-raised" fill="none" strokeWidth="1.8">
          <path d="M4 18 L10 10 L14 14 L20 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="font-display text-[16px] leading-[1.15]">Contando Centavos</span>
    </div>
  );
}

function NavItem({ label, icon, active }: { label: string; icon: string; active: boolean }) {
  return (
    <a
      className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-[14.5px] cursor-default select-none ${
        active ? "bg-brand-soft/10 text-brand font-semibold" : "text-ink-soft"
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" strokeWidth="1.6" stroke="currentColor">
        {ICONS[icon]}
      </svg>
      {label}
    </a>
  );
}
