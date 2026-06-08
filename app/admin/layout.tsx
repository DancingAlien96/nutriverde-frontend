export const metadata = {
  title: "Admin — Plenha Nutrition",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // /admin/login y resto comparten metadata pero solo /admin/* (no login) usa AdminShell.
  // El shell se aplica a nivel de cada page para evitar redirects en el login mismo.
  return children;
}
