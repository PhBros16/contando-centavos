"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UserAvatar({
  profileId,
  fullName,
  avatarUrl,
  avatarColor,
}: {
  profileId: string;
  fullName: string;
  avatarUrl: string | null;
  avatarColor: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `${profileId}/avatar.${file.name.split(".").pop()}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Adiciona um timestamp pra evitar cache da imagem antiga com o mesmo nome
      const freshUrl = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: freshUrl }).eq("id", profileId);
      setPreview(freshUrl);
      router.refresh();
    }

    setUploading(false);
  }

  const initial = fullName.charAt(0).toUpperCase();

  return (
    <button
      onClick={() => inputRef.current?.click()}
      title="Trocar foto"
      className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-hairline"
      style={{ background: avatarColor }}
    >
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={fullName} className="w-full h-full object-cover" />
      ) : (
        <span className="w-full h-full flex items-center justify-center text-paper-raised font-bold text-sm">
          {initial}
        </span>
      )}
      {uploading && (
        <span className="absolute inset-0 bg-ink/50 flex items-center justify-center text-[9px] text-paper-raised">
          …
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </button>
  );
}
