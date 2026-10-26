"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { adminMe, clearToken, getToken, isSecretary, type Admin } from "../lib/admin";
import { useLocale } from "../lib/i18n";
import { toSiteLocale, useAdminT, type AdminDict } from "../lib/admin-i18n";
import {
  HomeIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CardIcon,
  PlateIcon,
  GearIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  LeafBranch,
} from "./icons";

type NavItem = {
  href: string;
  label: keyof AdminDict["nav"];
  icon: (p: { className?: string }) => React.ReactNode;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "home", icon: HomeIcon, exact: true },
  { href: "/admin/citas", label: "appointments", icon: CalendarIcon },
  { href: "/admin/availability", label: "availability", icon: ClockIcon },
  { href: "/admin/patients", label: "patients", icon: UsersIcon },
  { href: "/admin/pagos", label: "payments", icon: CardIcon },
  { href: "/admin/services", label: "services", icon: PlateIcon },
  // Solo nutricionista: ver navFor/canVisit.
  { href: "/admin/users", label: "users", icon: GearIcon },
];

const NUTRITIONIST_ONLY = ["/admin/users"];

// La secretaria solo tiene la agenda. Cualquier otra ruta del panel la manda
// de vuelta a /admin/citas (el backend también la rechaza con 403, esto es
// solo para que nunca vea una pantalla rota).
const SECRETARY_HOME = "/admin/citas";
const SECRETARY_ALLOWED = ["/admin/citas"];

function navFor(admin: Admin | null): NavItem[] {
  if (isSecretary(admin?.role)) {
    return NAV.filter((n) => SECRETARY_ALLOWED.includes(n.href));
  }
  if (admin?.role !== "NUTRITIONIST") {
    return NAV.filter((n) => !NUTRITIONIST_ONLY.includes(n.href));
  }
  return NAV;
}

function homeFor(admin: Admin | null): string {
  return isSecretary(admin?.role) ? SECRETARY_HOME : "/admin";
}

function canVisit(admin: Admin, pathname: string | null): boolean {
  if (!pathname) return true;
  const under = (p: string) => pathname === p || pathname.startsWith(p + "/");
  if (isSecretary(admin.role)) return SECRETARY_ALLOWED.some(under);
  if (admin.role !== "NUTRITIONIST" && NUTRITIONIST_ONLY.some(under)) return false;
  return true;
}

function isActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useAdminT();
  const { setLocale } = useLocale();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    adminMe()
      .then(({ admin: a }) => {
        if (cancelled) return;
        if (!canVisit(a, pathname)) {
          router.replace(homeFor(a));
          return;
        }
        // El idioma del panel viene del usuario, no del navegador.
        setLocale(toSiteLocale(a.locale));
        setAdmin(a);
        setLoading(false);
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
  }, [router, pathname, setLocale]);

  // Cierra el drawer al navegar
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  function handleLogout() {
    clearToken();
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 text-sm text-brand-700">
        {t.common.loading}
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <Link href={homeFor(admin)} className="block px-6 pt-7 pb-6 leading-none">
        <span className="block font-serif-display text-2xl tracking-[0.06em] text-ink-900">
          PLENHA
        </span>
        <span className="block text-[10px] tracking-widest-2 uppercase text-brand-600 mt-1">
          Nutrition
        </span>
      </Link>

      {/* Navegación */}
      <nav className="flex-1 px-3 space-y-1">
        {navFor(admin).map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-300 text-brand-900 shadow-sm"
                  : "text-ink-600 hover:bg-cream-200/70 hover:text-ink-900"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {t.nav[item.label]}
            </Link>
          );
        })}
      </nav>

      {/* Decoración */}
      <div className="px-6 pointer-events-none">
        <LeafBranch className="h-24 w-auto text-brand-300/60" />
      </div>

      {/* Perfil */}
      <div className="m-3 rounded-2xl bg-cream-100 border border-cream-200 p-3 flex items-center gap-3">
        <span className="h-10 w-10 shrink-0 rounded-full bg-brand-400 text-white flex items-center justify-center text-sm font-semibold">
          {initials(admin?.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900 truncate">
            {admin?.fullName ?? "Admin"}
          </p>
          <p className="text-xs text-ink-500 truncate capitalize">
            {roleLabel(admin?.role, t)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label={t.common.signOut}
          className="h-8 w-8 shrink-0 rounded-full text-ink-500 hover:text-ink-900 hover:bg-cream-200 flex items-center justify-center transition-colors"
        >
          <LogoutIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Sidebar fijo (desktop) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 bg-cream-50 border-r border-cream-200">
        {sidebar}
      </aside>

      {/* Barra superior móvil */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-cream-50/95 backdrop-blur border-b border-cream-200 px-4 py-3">
        <Link href={homeFor(admin)} className="leading-none">
          <span className="font-serif-display text-xl tracking-[0.06em] text-ink-900">
            PLENHA
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label={t.common.openMenu}
          className="h-9 w-9 rounded-full text-ink-700 hover:bg-cream-200 flex items-center justify-center"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Drawer móvil */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ink-900/30"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-cream-50 shadow-xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label={t.common.closeMenu}
              className="absolute top-4 right-4 h-8 w-8 rounded-full text-ink-600 hover:bg-cream-200 flex items-center justify-center"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* Contenido */}
      <main className="lg:pl-60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-6 lg:py-9">
          {children}
        </div>
      </main>
    </div>
  );
}

function initials(name?: string): string {
  if (!name) return "·";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "·";
}

function roleLabel(role: string | undefined, t: AdminDict): string {
  switch ((role ?? "").toUpperCase()) {
    case "NUTRITIONIST":
    case "OWNER":
      return t.roles.NUTRITIONIST;
    case "SECRETARY":
      return t.roles.SECRETARY;
    case "STAFF":
    case "ADMIN":
      return t.roles.STAFF;
    default:
      return role ? role.toLowerCase() : t.roles.default;
  }
}
