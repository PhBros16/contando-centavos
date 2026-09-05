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
  metadataBase: new URL("https://contando-centavos.vercel.app"),
  openGraph: {
    title: "Contando Centavos",
    description: "Acompanhamento financeiro pessoal com orçamento, metas e previsões.",
    url: "https://contando-centavos.vercel.app",
    siteName: "Contando Centavos",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contando Centavos",
    description: "Acompanhamento financeiro pessoal com orçamento, metas e previsões.",
    images: ["/og-image.png"],
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
