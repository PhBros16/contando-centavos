// Cores de marca são fatos públicos, não obra protegida — mas o logo em si é.
// Por isso usamos monograma + cor, nunca o logotipo oficial de cada instituição.
export type BankPreset = {
  id: string;
  name: string;
  monogram: string;
  color: string;
  lightText?: boolean;
};

export const BANK_PRESETS: BankPreset[] = [
  { id: "nubank", name: "Nubank", monogram: "Nu", color: "#820AD1" },
  { id: "itau", name: "Itaú", monogram: "It", color: "#EC7000" },
  { id: "bradesco", name: "Bradesco", monogram: "Bra", color: "#CC092F" },
  { id: "bb", name: "Banco do Brasil", monogram: "BB", color: "#003087" },
  { id: "caixa", name: "Caixa", monogram: "CX", color: "#0070B8" },
  { id: "santander", name: "Santander", monogram: "SX", color: "#EC0000" },
  { id: "inter", name: "Inter", monogram: "In", color: "#FF7A00" },
  { id: "c6", name: "C6 Bank", monogram: "C6", color: "#1B1B1F" },
  { id: "picpay", name: "PicPay", monogram: "PP", color: "#21C25E" },
  { id: "mercadopago", name: "Mercado Pago", monogram: "MP", color: "#00AEEF" },
  { id: "carteira", name: "Carteira física", monogram: "$", color: "#6B6B6B" },
  { id: "outro", name: "Outro / Personalizado", monogram: "?", color: "#9AA39D" },
];
