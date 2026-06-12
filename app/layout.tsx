import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "./lib/i18n";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "Plenha Nutrition — Asesoría nutricional online",
  description:
    "Asesoría nutricional personalizada y basada en evidencia con la nutricionista clínica Dulce Menzel. Hábitos sostenibles adaptados a tu estilo de vida y objetivos.",
  // Sitio privado por referencia — no indexar en buscadores
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
