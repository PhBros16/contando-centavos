"use client";

import { BANK_PRESETS, type BankPreset } from "@/lib/banks";

export function BankPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (bank: BankPreset) => void;
}) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
      {BANK_PRESETS.map((bank) => {
        const selected = bank.id === selectedId;
        return (
          <button
            type="button"
            key={bank.id}
            onClick={() => onSelect(bank)}
            title={bank.name}
            className={`flex flex-col items-center gap-1.5 py-2 rounded-lg transition-all ${
              selected ? "ring-2 ring-offset-2 ring-offset-paper ring-brand" : "hover:opacity-80"
            }`}
          >
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: bank.color, color: bank.lightText === false ? "#1B1B1F" : "#F5F4F0" }}
            >
              {bank.monogram}
            </span>
            <span className="text-[10px] text-ink-faint text-center leading-tight px-0.5">
              {bank.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
