"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let reloading = false;

    // Sem isso, um celular que já tinha o app instalado antes de uma
    // correção ir pro ar podia ficar rodando o service worker velho por
    // horas (o navegador só rechecava o /sw.js sozinho de tempos em
    // tempos) — foi exatamente o que aconteceu com o bug do cadastro: a
    // correção já estava no ar, mas o celular da pessoa ainda usava a
    // versão quebrada. Agora, assim que um SW novo assume o controle, a
    // página recarrega uma vez sozinha pra garantir que está na versão
    // mais recente.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Força checar por uma versão nova toda vez que o app é aberto,
        // em vez de confiar só no intervalo padrão do navegador.
        registration.update().catch(() => {});
      })
      .catch(() => {
        // Falha silenciosa — o app funciona normalmente sem PWA instalável
      });
  }, []);

  return null;
}
