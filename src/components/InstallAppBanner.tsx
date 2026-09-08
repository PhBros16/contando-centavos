"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "cc_install_prompt_dismissed";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    setPlatform(detectPlatform());
    setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!visible || platform === "other") return null;

  return (
    <div className="flex items-start gap-3 rounded-card px-4 py-3.5 mb-6 text-sm bg-brand-soft/10">
      <span className="text-lg shrink-0">📲</span>
      <div className="flex-1">
        <p className="font-semibold mb-0.5">Instale o app na tela de início</p>
        <p className="text-xs text-ink-soft leading-relaxed">
          {platform === "ios"
            ? "Toque no ícone de compartilhar (⬆️) do Safari e escolha \"Adicionar à Tela de Início\"."
            : "Toque no menu (⋮) do Chrome e escolha \"Adicionar à tela inicial\" ou \"Instalar app\"."}
        </p>
      </div>
      <button onClick={dismiss} className="text-ink-faint hover:text-ink shrink-0 text-lg leading-none">
        ×
      </button>
    </div>
  );
}
