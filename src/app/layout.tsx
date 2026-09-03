import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Contando Centavos — Acompanhamento financeiro pessoal",
  description: "Contas, orçamento, metas e previsões, tudo em um só lugar.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Centavos",
  },
};

export const viewport: Viewport = {
  themeColor: "#2F5D50",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
