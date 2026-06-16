"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "../lib/data";
import { useLocale } from "../lib/i18n";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, locale, setLocale } = useLocale();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Etiqueta de cada enlace según idioma.
  const navLabel: Record<string, string> = {
    "/sobre-mi": t.nav.sobreMi,
    "/servicios": t.nav.servicios,
    "/como-funciona": t.nav.comoFunciona,
    "/testimonios": t.nav.testimonios,
    "/faq": t.nav.faq,
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-30 transition-colors duration-200 ${
        scrolled || open
          ? "bg-cream-50/95 backdrop-blur border-b border-cream-200"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
        {/* Logo + tagline */}
        <Link href="/" className="leading-none">
          <span className="block font-serif-display text-2xl sm:text-[28px] tracking-[0.08em] text-ink-900">
            PLENHA
          </span>
          <span className="hidden sm:block text-[8px] tracking-widest-2 uppercase text-ink-500 mt-1">
            {t.header.tagline}
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-700 hover:text-ink-900 transition-colors"
            >
              {navLabel[link.href] ?? link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LangToggle locale={locale} setLocale={setLocale} />

          <Link
            href="/agendar"
            className="rounded-full bg-brand-400 hover:bg-brand-500 px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-medium text-white transition-colors whitespace-nowrap tracking-wide uppercase"
          >
            <span className="hidden sm:inline">{t.header.agendar}</span>
            <span className="sm:hidden">{t.header.agendarShort}</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={t.header.openMenu}
            aria-expanded={open}
            className="lg:hidden h-10 w-10 rounded-full border border-brand-200 text-ink-800 flex items-center justify-center"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden mx-4 mb-4 rounded-2xl bg-white border border-cream-200 shadow-xl p-2">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-ink-900 hover:bg-cream-50 rounded-xl"
                >
                  {navLabel[link.href] ?? link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

function LangToggle({
  locale,
  setLocale,
}: {
  locale: "en" | "es";
  setLocale: (l: "en" | "es") => void;
}) {
  return (
    <div
      className="flex items-center rounded-full border border-brand-200 bg-white/70 p-0.5 text-[11px] font-semibold"
      role="group"
      aria-label="Language / Idioma"
    >
      {(["en", "es"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`px-2 py-1 rounded-full uppercase transition-colors ${
            locale === l
              ? "bg-brand-400 text-white"
              : "text-ink-600 hover:text-ink-900"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
