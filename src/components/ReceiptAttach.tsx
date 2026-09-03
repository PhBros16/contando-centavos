"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ReceiptAttach({
  transactionId,
  householdId,
  receiptPath,
  onUploaded,
}: {
  transactionId: string;
  householdId: string;
  receiptPath: string | null;
  onUploaded?: (path: string) => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `${householdId}/${transactionId}.${file.name.split(".").pop()}`;

    const { error: uploadError } = await supabase.storage.from("receipts").upload(path, file, { upsert: true });

    if (!uploadError) {
      await supabase.from("transactions").update({ receipt_path: path }).eq("id", transactionId);
      onUploaded?.(path);
      router.refresh();
    }

    setUploading(false);
  }

  async function handleView() {
    if (!receiptPath) return;
    const { data } = await supabase.storage.from("receipts").createSignedUrl(receiptPath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function handleRemove() {
    if (!receiptPath || !confirm("Remover o comprovante anexado?")) return;
    await supabase.storage.from("receipts").remove([receiptPath]);
    await supabase.from("transactions").update({ receipt_path: null }).eq("id", transactionId);
    router.refresh();
  }

  if (receiptPath) {
    return (
      <div className="flex items-center gap-1.5">
        <button onClick={handleView} className="text-xs font-semibold text-brand hover:underline">
          📎 Ver comprovante
        </button>
        <button onClick={handleRemove} className="text-xs text-ink-faint hover:text-wine">
          ×
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs font-semibold text-ink-faint hover:text-ink"
      >
        {uploading ? "Enviando…" : "📎 Anexar"}
      </button>
      <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
    </>
  );
}
