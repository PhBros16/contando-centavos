// Script pontual — não faz parte do runtime do app.
// Rode "npm install sharp" antes de executar, caso precise regenerar os ícones
// (sharp não fica como dependência do projeto pra não pesar o build de produção).
import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

// Mesmo traço "crescente" usado na marca do app, em escala cheia pro ícone
const svg = (padding) => `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2F5D50"/>
  <path d="M${100 + padding} ${340 - padding} L${210 + padding} ${220} L${280} ${290 - padding} L${400 - padding} ${140 + padding}"
    stroke="#F6F5F1" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

const sizes = [
  { file: "icon-192.png", size: 192, padding: 0 },
  { file: "icon-512.png", size: 512, padding: 0 },
  { file: "apple-touch-icon.png", size: 180, padding: 0 },
];

for (const { file, size, padding } of sizes) {
  await sharp(Buffer.from(svg(padding)))
    .resize(size, size)
    .png()
    .toFile(`public/icons/${file}`);
  console.log("gerado:", file);
}
