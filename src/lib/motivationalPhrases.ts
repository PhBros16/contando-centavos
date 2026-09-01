// Frases variam conforme a faixa de progresso, pra sempre parecer relevante
// e não repetir a mesma coisa genérica de novo.

const EARLY = [
  "Todo objetivo grande começa com o primeiro real guardado.",
  "O começo é a parte mais difícil — o resto fica mais fácil daqui pra frente.",
  "Consistência pequena e constante bate esforço grande e raro.",
];

const MID = [
  "Você já passou da metade do caminho mais difícil.",
  "Cada aporte te deixa mais perto do que parecia distante.",
  "Mantendo esse ritmo, a meta deixa de ser sonho e vira data.",
];

const LATE = [
  "Está quase lá — não é hora de desacelerar.",
  "A reta final costuma passar mais rápido do que parece.",
  "Você já provou que consegue chegar até aqui.",
];

const DONE = [
  "Meta batida! Hora de comemorar antes de traçar a próxima.",
  "Você conseguiu. Esse resultado é seu.",
];

export function motivationalPhrase(progressPct: number, seed: string): string {
  const bucket = progressPct >= 100 ? DONE : progressPct >= 66 ? LATE : progressPct >= 33 ? MID : EARLY;
  // "seed" (ex: id da meta) garante que a mesma meta sempre mostra a mesma frase
  // na mesma sessão, em vez de trocar a cada re-render.
  const index = Math.abs(hashCode(seed)) % bucket.length;
  return bucket[index];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
