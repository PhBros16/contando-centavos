import { formatCurrency } from "@/lib/format";

export function ForecastCard({
  projectedBalance,
  alertMessage,
}: {
  projectedBalance: number;
  alertMessage?: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-card px-6 pt-6 pb-6 text-[#F2EFE8]"
      style={{ background: "rgb(var(--forecast-bg))" }}
    >
      <div
        className="absolute -top-14 -right-14 w-[200px] h-[200px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgb(var(--gold) / 0.16), transparent 70%)",
        }}
      />
      <span className="relative text-xs font-semibold text-[#F2EFE8]/55">
        Previsão para os próximos 30 dias
      </span>
      <div className="relative font-display text-[34px] font-medium my-2" style={{ color: "rgb(var(--gold))" }}>
        {formatCurrency(projectedBalance)}
      </div>
      <p className="relative text-xs leading-relaxed text-[#F2EFE8]/70">
        Com base nas suas recorrências cadastradas e na média de gastos dos últimos meses.
      </p>
      {alertMessage && (
        <div className="relative mt-3.5 pt-3.5 border-t border-[#F2EFE8]/10 text-xs leading-relaxed text-[#F2EFE8]/85">
          {alertMessage}
        </div>
      )}
    </div>
  );
}
