"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { adminMe, clearToken, getToken, type Admin } from "../lib/admin";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    adminMe()
      .then(({ admin: a }) => {
        if (!cancelled) {
          setAdmin(a);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearToken();
          router.replace("/admin/login");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  function handleLogout() {
    clearToken();
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Cargando…
      </div>
    );
  }

  const navLinks: { href: string; label: string }[] = [
    { href: "/admin", label: "Pagos" },
    { href: "/admin/availability", label: "Disponibilidad" },
    { href: "/admin/services", label: "Servicios" },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-white border-b border-cream-200 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-6">
          <Link href="/admin" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="font-serif-display text-lg sm:text-xl text-gray-900">NutriVerde</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 sm:py-1 rounded-full border border-brand-200">
              Admin
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 text-sm shrink-0">
            <span className="text-gray-600 hidden lg:inline">
              {admin?.fullName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap"
            >
              <span className="hidden sm:inline">Cerrar sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>

        {/* Nav móvil */}
        <nav className="md:hidden border-t border-cream-200 px-4 sm:px-6 py-2 flex gap-1 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
    </div>
  );
}
