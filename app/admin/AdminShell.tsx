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
  ChevronLeftIcon,
  ChevronRightIcon,
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
// Citas, disponibilidad y pacientes (sin expediente clínico ni pagos).
const SECRETARY_ALLOWED = ["/admin/citas", "/admin/availability", "/admin/patients"];

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

// El menú lateral de escritorio se puede contraer a solo iconos. Se recuerda
// en el navegador porque cada página monta su propio AdminShell.
const COLLAPSE_KEY = "nutriverde_admin_sidebar_collapsed";

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
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
  const [collapsed, setCollapsed] = useState(readCollapsed);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      // Sin almacenamiento (modo privado): el cambio vale solo en esta página.
    }
  }
  // PWA: el navegador avisa cuando la app se puede instalar; guardamos el
  // evento para disparar el dialogo desde el boton "Instalar app".
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

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

  // `mini`: solo iconos (escritorio contraído). `withToggle`: muestra el botón
  // de contraer/desplegar; el cajón del móvil no lo lleva.
  const renderSidebar = (mini: boolean, withToggle: boolean) => (
    <div className="flex h-full flex-col">
      {/* Logo + botón de contraer */}
      <div
        className={`flex pt-7 pb-6 ${
          mini ? "flex-col items-center gap-3 px-2" : "items-start justify-between px-6"
        }`}
      >
        <Link href={homeFor(admin)} className="block leading-none" aria-label="Plenha Nutrition">
          {mini ? (
            <span className="block font-serif-display text-2xl text-ink-900">P</span>
          ) : (
            <>
              <span className="block font-serif-display text-2xl tracking-[0.06em] text-ink-900">
                PLENHA
              </span>
              <span className="block text-[10px] tracking-widest-2 uppercase text-brand-600 mt-1">
                Nutrition
              </span>
            </>
          )}
        </Link>
        {withToggle && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!mini}
            aria-label={mini ? t.common.expandMenu : t.common.collapseMenu}
            title={mini ? t.common.expandMenu : t.common.collapseMenu}
            className="h-8 w-8 shrink-0 rounded-full border border-cream-200 bg-white text-ink-500 hover:text-ink-900 hover:bg-cream-100 flex items-center justify-center transition-colors"
          >
            {mini ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className={`flex-1 space-y-1 ${mini ? "px-2" : "px-3"}`}>
        {navFor(admin).map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={mini ? t.nav[item.label] : undefined}
              aria-label={mini ? t.nav[item.label] : undefined}
              aria-current={active ? "page" : undefined}
              className={`flex items-center rounded-2xl py-2.5 text-sm font-medium transition-colors ${
                mini ? "justify-center px-0" : "gap-3 px-4"
              } ${
                active
                  ? "bg-brand-300 text-brand-900 shadow-sm"
                  : "text-ink-600 hover:bg-cream-200/70 hover:text-ink-900"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!mini && t.nav[item.label]}
            </Link>
          );
        })}
      </nav>

      {/* Instalar como app (solo aparece si el navegador lo permite) */}
      {installPrompt && !mini && (
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={handleInstall}
            className="w-full rounded-2xl border border-brand-300 bg-brand-50 px-4 py-2 text-xs font-medium text-brand-800 hover:bg-brand-100"
          >
            {t.common.installApp}
          </button>
        </div>
      )}

      {/* Decoración */}
      {!mini && (
        <div className="px-6 pointer-events-none">
          <LeafBranch className="h-24 w-auto text-brand-300/60" />
        </div>
      )}

      {/* Perfil */}
      {mini ? (
        <div className="mb-3 flex flex-col items-center gap-2">
          <span
            title={`${admin?.fullName ?? "Admin"} · ${roleLabel(admin?.role, t)}`}
            className="h-10 w-10 shrink-0 rounded-full bg-brand-400 text-white flex items-center justify-center text-sm font-semibold"
          >
            {initials(admin?.fullName)}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label={t.common.signOut}
            title={t.common.signOut}
            className="h-8 w-8 shrink-0 rounded-full text-ink-500 hover:text-ink-900 hover:bg-cream-200 flex items-center justify-center transition-colors"
          >
            <LogoutIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Sidebar fijo (desktop) */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 bg-cream-50 border-r border-cream-200 transition-[width] duration-200 ${
          collapsed ? "w-[4.5rem]" : "w-60"
        }`}
      >
        {renderSidebar(collapsed, true)}
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
            {renderSidebar(false, false)}
          </div>
        </div>
      )}

      {/* Contenido */}
      <main
        className={`transition-[padding] duration-200 ${
          collapsed ? "lg:pl-[4.5rem]" : "lg:pl-60"
        }`}
      >
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

/** Evento no estandarizado de Chromium para el prompt de instalacion PWA. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
