export type Period = "dia" | "semana" | "mes" | "ano";

const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function toStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(d: Date): Date {
  // Semana começando na segunda-feira (padrão brasileiro)
  const day = d.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  return start;
}

export function getPeriodRange(
  period: Period,
  anchorStr: string
): { start: string; end: string; label: string } {
  const anchor = new Date(anchorStr + "T00:00:00");

  if (period === "dia") {
    const end = new Date(anchor);
    end.setDate(end.getDate() + 1);
    return {
      start: toStr(anchor),
      end: toStr(end),
      label: anchor.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
    };
  }

  if (period === "semana") {
    const start = startOfWeek(anchor);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const lastDay = new Date(end);
    lastDay.setDate(lastDay.getDate() - 1);
    return {
      start: toStr(start),
      end: toStr(end),
      label: `Semana de ${start.getDate()} a ${lastDay.getDate()} de ${MONTH_NAMES[lastDay.getMonth()]}`,
    };
  }

  if (period === "mes") {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
    return {
      start: toStr(start),
      end: toStr(end),
      label: `${MONTH_NAMES[start.getMonth()][0].toUpperCase()}${MONTH_NAMES[start.getMonth()].slice(1)} de ${start.getFullYear()}`,
    };
  }

  // ano
  const start = new Date(anchor.getFullYear(), 0, 1);
  const end = new Date(anchor.getFullYear() + 1, 0, 1);
  return { start: toStr(start), end: toStr(end), label: `${start.getFullYear()}` };
}

export function shiftAnchor(period: Period, anchorStr: string, direction: 1 | -1): string {
  const anchor = new Date(anchorStr + "T00:00:00");

  if (period === "dia") anchor.setDate(anchor.getDate() + direction);
  else if (period === "semana") anchor.setDate(anchor.getDate() + direction * 7);
  else if (period === "mes") anchor.setMonth(anchor.getMonth() + direction);
  else anchor.setFullYear(anchor.getFullYear() + direction);

  return toStr(anchor);
}

export function groupByDay<T extends { occurred_at: string }>(items: T[]): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const list = map.get(item.occurred_at) ?? [];
    list.push(item);
    map.set(item.occurred_at, list);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

export function groupByMonth<T extends { occurred_at: string }>(items: T[]): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = item.occurred_at.slice(0, 7); // YYYY-MM
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

export function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

export function formatMonthKeyLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const name = MONTH_NAMES[month - 1];
  return `${name[0].toUpperCase()}${name.slice(1)} de ${year}`;
}
