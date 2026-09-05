// Script pontual — rode "npm install sharp" antes de executar.
import sharp from "sharp";

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="85%" cy="15%" r="60%">
      <stop offset="0%" stop-color="#B08A42" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#B08A42" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#F6F5F1"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Marca -->
  <rect x="100" y="100" width="72" height="72" rx="18" fill="#2F5D50"/>
  <path d="M122 152 L146 128 L158 140 L182 108" stroke="#F6F5F1" stroke-width="8"
    stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- Título -->
  <text x="100" y="270" font-family="Georgia, serif" font-size="64" fill="#191D1A" font-weight="500">
    Contando Centavos
  </text>

  <!-- Subtítulo -->
  <text x="100" y="320" font-family="Arial, sans-serif" font-size="28" fill="#5B6660">
    Acompanhamento financeiro pessoal
  </text>
  <text x="100" y="358" font-family="Arial, sans-serif" font-size="28" fill="#5B6660">
    com orçamento, metas e previsões
  </text>

  <!-- Número decorativo grande, estilo "número protagonista" -->
  <text x="100" y="500" font-family="Georgia, serif" font-size="56" fill="#B08A42" font-weight="500">
    R$ 24.180,42
  </text>
  <text x="100" y="540" font-family="Arial, sans-serif" font-size="22" fill="#9AA39D">
    Saldo total — exemplo de tela do app
  </text>

  <!-- Linha decorativa tipo sparkline -->
  <path d="M700,540 C 740,520 760,550 800,510 C 840,470 870,500 910,460 C 950,420 980,440 1020,400 C 1060,360 1080,380 1100,340"
    fill="none" stroke="#2F5D50" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
</svg>`;

await sharp(Buffer.from(svg)).resize(1200, 630).png().toFile("public/og-image.png");
console.log("gerado: public/og-image.png");
