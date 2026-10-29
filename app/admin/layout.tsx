import type { Metadata, Viewport } from "next";
import { PwaRegister } from "./PwaRegister";

export const metadata: Metadata = {
  title: "Admin — Plenha Nutrition",
  robots: { index: false, follow: false },
  // PWA del panel: el manifiesto vive en app/manifest.ts (scope /admin/) y
  // Next lo enlaza solo.
  appleWebApp: {
    capable: true,
    title: "Plenha Admin",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/admin-apple-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6f854c",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // /admin/login y resto comparten metadata pero solo /admin/* (no login) usa AdminShell.
  // El shell se aplica a nivel de cada page para evitar redirects en el login mismo.
  return (
    <>
      <PwaRegister />
      {children}
    </>
  );
}
