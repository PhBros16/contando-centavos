"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Visão geral", icon: "home", href: "/dashboard", real: true },
  { label: "Transações", icon: "list", href: "/dashboard/transactions", real: true },
  { label: "Contas", icon: "wallet", href: "/dashboard/accounts", real: true },
  { label: "Categorias", icon: "tag", href: "/dashboard/categories", real: true },
  { label: "Despesas", icon: "bill", href: "/dashboard/bills/new", real: true },
  { label: "Orçamento", icon: "budget", href: "/dashboard/budgets/new", real: true },
  { label: "Metas", icon: "goal", href: "/dashboard/goals/new", real: true },
  { label: "Investimentos", icon: "trend", href: "/dashboard/investments", real: true },
  { label: "Recorrências", icon: "repeat", href: "/dashboard/recurring/new", real: true },
  { label: "Importar", icon: "upload", href: "/dashboard/import", real: true },
  { label: "Simulador", icon: "simulator", href: "/dashboard/simulator", real: true },
  { label: "Exportar", icon: "download", href: "/dashboard/export", real: true },
  { label: "Guia", icon: "book", href: "/dashboard/guide", real: true },
];

const ICONS: Record<string, React.ReactNode> = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  list: <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />,
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M16 12.5h2" strokeLinecap="round" />
      <path d="M3 9h18" />
    </>
  ),
  tag: (
    <>
      <path d="M11 3 20 12l-8 8-9-9V3Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.3" />
    </>
  ),
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
  trend: (
    <>
      <path d="M4 16 9 9l4 4 7-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" strokeLinecap="round" />
    </>
  ),
  forecast: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4.5" />
    </>
  ),
  repeat: (
    <>
      <path d="M17 2 21 6l-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 22 3 18l4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M12 4 7 9M12 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  simulator: (
    <>
      <path d="M4 20 4 12 10 12 10 20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 20 14 4 20 4 20 20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" strokeLinecap="round" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M12 15 7 10M12 15l5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19h16" strokeLinecap="round" />
    </>
  ),
};

export function Sidebar({ activeLabel }: { activeLabel?: string }) {
  const pathname = usePathname();

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.real && (activeLabel ? item.label === activeLabel : pathname === item.href);

  return (
    <>
      {/* Desktop: coluna fixa à esquerda */}
      <aside className="hidden md:flex w-[232px] shrink-0 flex-col border-r border-hairline px-5 py-7">
        <Brand />
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.label} {...item} active={isActive(item)} />
          ))}
        </nav>
      </aside>

      {/* Mobile: barra fixa inferior, rolável horizontalmente pra caber tudo */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex gap-1 overflow-x-auto border-t border-hairline bg-paper-raised px-2 py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] shrink-0 ${
              isActive(item) ? "text-brand" : "text-ink-faint"
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" strokeWidth="1.6" stroke="currentColor">
              {ICONS[item.icon]}
            </svg>
            {item.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-2 pb-7">
      <div className="w-[30px] h-[30px] rounded-[9px] bg-brand flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-paper-raised" fill="none" strokeWidth="1.8">
          <path d="M4 18 L10 10 L14 14 L20 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="font-display text-[16px] leading-[1.15]">Contando Centavos</span>
    </Link>
  );
}

function NavItem({
  label,
  icon,
  href,
  active,
}: {
  label: string;
  icon: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-[14.5px] select-none ${
        active ? "bg-brand-soft/10 text-brand font-semibold" : "text-ink-soft hover:text-ink"
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" strokeWidth="1.6" stroke="currentColor">
        {ICONS[icon]}
      </svg>
      {label}
    </Link>
  );
}
