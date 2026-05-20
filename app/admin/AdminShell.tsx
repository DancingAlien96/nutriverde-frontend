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

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-white border-b border-cream-200 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="font-serif-display text-xl text-gray-900">NutriVerde</span>
            <span className="text-xs uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-1 rounded-full border border-brand-200">
              Admin
            </span>
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 hidden sm:inline">
              {admin?.fullName} · {admin?.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
