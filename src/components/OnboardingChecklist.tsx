"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = { label: string; href: string; done: boolean };

export function OnboardingChecklist({
  profileId,
  hasAccount,
  hasTransaction,
  hasBudget,
  hasGoal,
}: {
  profileId: string;
  hasAccount: boolean;
  hasTransaction: boolean;
  hasBudget: boolean;
  hasGoal: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const steps: Step[] = [
    { label: "Criar sua primeira conta", href: "/dashboard/accounts/new", done: hasAccount },
    { label: "Lançar uma transação", href: "/dashboard", done: hasTransaction },
    { label: "Definir um orçamento (opcional)", href: "/dashboard/budgets/new", done: hasBudget },
    { label: "Criar uma meta (opcional)", href: "/dashboard/goals/new", done: hasGoal },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  async function dismiss() {
    await supabase.from("profiles").update({ onboarding_dismissed: true }).eq("id", profileId);
    router.refresh();
  }

  return (
    <div className="rounded-card border border-hairline bg-paper-raised px-5 py-4 mb-6">
      <div className="flex justify-between items-center mb-3.5">
        <div>
          <h3 className="text-sm font-bold">Primeiros passos</h3>
          <p className="text-xs text-ink-faint mt-0.5">
            {doneCount} de {steps.length} concluídos
          </p>
        </div>
        <button onClick={dismiss} className="text-xs text-ink-faint hover:text-ink transition-colors">
          Pular
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {steps.map((step) => (
          <Link
            key={step.label}
            href={step.href}
            className={`flex items-center gap-2.5 text-sm ${step.done ? "text-ink-faint" : "text-ink hover:text-brand"}`}
          >
            <span
              className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px]"
              style={{
                borderColor: step.done ? "rgb(var(--brand))" : "rgb(var(--hairline))",
                background: step.done ? "rgb(var(--brand))" : "transparent",
                color: "#fff",
              }}
            >
              {step.done ? "✓" : ""}
            </span>
            <span className={step.done ? "line-through" : ""}>{step.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
