"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushNotificationToggle() {
  const supabase = createClient();
  const [status, setStatus] = useState<"loading" | "unsupported" | "off" | "on">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setStatus(subscription ? "on" : "off");
    }
    check();
  }, []);

  async function handleEnable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setBusy(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "") as BufferSource,
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", user!.id)
        .single();

      const json = subscription.toJSON();
      await supabase.from("push_subscriptions").upsert(
        {
          household_id: profile!.household_id,
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh,
          auth_key: json.keys!.auth,
        },
        { onConflict: "endpoint" }
      );

      setStatus("on");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") return null;
  if (status === "unsupported") {
    return <p className="text-sm text-ink-faint">Seu navegador não suporta notificações push.</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={status === "on" ? handleDisable : handleEnable}
        disabled={busy}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60 ${
          status === "on" ? "border border-hairline text-ink-soft hover:text-ink" : "bg-brand text-paper-raised hover:opacity-90"
        }`}
      >
        {busy ? "Aguarde…" : status === "on" ? "Desativar notificações" : "Ativar notificações de vencimento"}
      </button>
      {status === "on" && <span className="text-xs text-brand font-semibold">Ativas neste dispositivo</span>}
    </div>
  );
}
