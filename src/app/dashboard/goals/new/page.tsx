"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const SUGGESTED_COLORS = ["#B08A42", "#2F5D50", "#8B3A48", "#4A6FA5", "#7C6E92", "#3E7C7C"];

export default function NewGoalPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [color, setColor] = useState(SUGGESTED_COLORS[0]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user!.id)
      .single();

    const householdId = profile!.household_id;
    let photoUrl: string | null = null;

    if (photoFile) {
      const path = `${householdId}/${Date.now()}.${photoFile.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage.from("goal-photos").upload(path, photoFile);
      if (uploadError) {
        setError("Não deu pra subir a foto: " + uploadError.message);
        setSaving(false);
        return;
      }
      photoUrl = supabase.storage.from("goal-photos").getPublicUrl(path).data.publicUrl;
    }

    const { error: insertError } = await supabase.from("goals").insert({
      household_id: householdId,
      name,
      target_amount: parseFloat(targetAmount.replace(",", ".")) || 0,
      current_amount: parseFloat(currentAmount.replace(",", ".")) || 0,
      target_date: targetDate || null,
      color,
      photo_url: photoUrl,
    });

    setSaving(false);

    if (insertError) setError(insertError.message);
    else router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10 flex justify-center">
      <div className="w-full max-w-lg">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-8 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <h1 className="font-display text-2xl font-medium mb-1">Nova meta</h1>
        <p className="text-sm text-ink-soft mb-8">
          Uma foto de capa ajuda a manter o objetivo sempre visível e te lembrar do porquê.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative h-32 rounded-card border border-dashed border-hairline overflow-hidden bg-paper-raised flex items-center justify-center text-sm text-ink-faint hover:text-ink transition-colors"
            style={photoPreview ? { backgroundImage: `url(${photoPreview})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            {!photoPreview && "Adicionar foto de capa (opcional)"}
            {photoPreview && (
              <span className="absolute inset-0 bg-black/35 flex items-center justify-center text-white text-xs font-semibold">
                Trocar foto
              </span>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-faint">Nome do objetivo</span>
            <input
              type="text"
              placeholder="ex: Viagem em família"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </label>

          <div className="flex gap-4">
            <label className="flex-1 flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-faint">Valor alvo</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand transition-colors"
              />
            </label>
            <label className="flex-1 flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-ink-faint">Já tenho guardado</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm font-display outline-none focus:border-brand transition-colors"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink-faint">Prazo (opcional)</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </label>

          <div>
            <span className="text-xs font-semibold text-ink-faint block mb-2">
              Cor (usada se não houver foto)
            </span>
            <div className="flex gap-2">
              {SUGGESTED_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? "ring-2 ring-offset-2 ring-offset-paper ring-ink scale-110" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-wine">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-paper-raised rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
          >
            {saving ? "Criando…" : "Criar meta"}
          </button>
        </form>
      </div>
    </main>
  );
}
