"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SettingsClient({ fullName: initialName }: { fullName: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleSaveName() {
    setSavingName(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", user!.id);
    setSavingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
    router.refresh();
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);

    if (error) setPasswordError(error.message);
    else {
      setPasswordSaved(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 2000);
    }
  }

  async function handleLogoutEverywhere() {
    await supabase.auth.signOut({ scope: "global" });
    router.push("/login");
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const { error } = await supabase.functions.invoke("delete-account");
    setDeleting(false);

    if (error) {
      alert("Não foi possível excluir a conta agora. Tente de novo em instantes.");
      return;
    }

    await supabase.auth.signOut();
    localStorage.removeItem("cc_remembered_user");
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h3 className="text-[15.5px] font-bold mb-3">Seu nome</h3>
        <div className="flex gap-2">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="flex-1 rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
          />
          <button
            onClick={handleSaveName}
            disabled={savingName}
            className="px-4 py-2.5 rounded-lg bg-ink text-paper text-sm font-semibold hover:opacity-85 transition-opacity disabled:opacity-60"
          >
            {nameSaved ? "Salvo ✓" : savingName ? "…" : "Salvar"}
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-[15.5px] font-bold mb-3">Trocar senha</h3>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-3 max-w-sm">
          <input
            type="password"
            placeholder="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="rounded-lg border border-hairline bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-brand transition-colors"
          />
          {passwordError && <p className="text-sm text-wine">{passwordError}</p>}
          <button
            type="submit"
            disabled={savingPassword}
            className="self-start px-4 py-2 rounded-lg bg-ink text-paper text-sm font-semibold hover:opacity-85 transition-opacity disabled:opacity-60"
          >
            {passwordSaved ? "Senha atualizada ✓" : savingPassword ? "Salvando…" : "Atualizar senha"}
          </button>
        </form>
      </section>

      <section>
        <h3 className="text-[15.5px] font-bold mb-3">Sessões</h3>
        <p className="text-sm text-ink-soft mb-3">
          Se você usou o app em outro computador ou celular e quer encerrar todas as sessões de
          uma vez (por segurança).
        </p>
        <button
          onClick={handleLogoutEverywhere}
          className="px-4 py-2 rounded-lg border border-hairline text-sm font-semibold text-ink-soft hover:text-ink"
        >
          Sair de todos os dispositivos
        </button>
      </section>

      <section className="pt-6 border-t border-hairline">
        <h3 className="text-[15.5px] font-bold mb-1 text-wine">Zona de risco</h3>
        <p className="text-sm text-ink-soft mb-3">
          Excluir sua conta remove todos os seus dados permanentemente. Não tem como desfazer.
        </p>
        <input
          placeholder='Digite "excluir" para confirmar'
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          className="rounded-lg border border-hairline bg-paper-raised px-3 py-2 text-sm outline-none focus:border-wine transition-colors mb-3 w-full max-w-xs"
        />
        <button
          onClick={handleDeleteAccount}
          disabled={deleteConfirmText.toLowerCase() !== "excluir" || deleting}
          className="block px-4 py-2 rounded-lg bg-wine text-paper-raised text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {deleting ? "Excluindo…" : "Excluir minha conta"}
        </button>
      </section>
    </div>
  );
}
