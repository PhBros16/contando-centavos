"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Visão geral", icon: "home", href: "/dashboard", real: true },
  { label: "Contas", icon: "wallet", href: "/dashboard/accounts/new", real: true },
  { label: "Categorias", icon: "tag", href: "/dashboard/categories", real: true },
  { label: "Despesas", icon: "bill", href: "/dashboard", real: false },
  { label: "Orçamento", icon: "budget", href: "/dashboard", real: false },
  { label: "Metas", icon: "goal", href: "/dashboard", real: false },
  { label: "Previsões", icon: "forecast", href: "/dashboard", real: false },
];

const ICONS: Record<string, React.ReactNode> = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
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
  forecast: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4.5" />
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

      {/* Mobile: barra fixa inferior com os itens principais */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t border-hairline bg-paper-raised px-1 py-2">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] ${
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
