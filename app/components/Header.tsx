"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "../lib/data";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute top-0 inset-x-0 z-20">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-serif-display text-xl sm:text-2xl text-white drop-shadow-sm"
        >
          NutriVerde
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/agendar"
            className="rounded-full border border-white/30 bg-white/10 backdrop-blur px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">Agendar consulta</span>
            <span className="sm:hidden">Agendar</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
            aria-expanded={open}
            className="md:hidden h-10 w-10 rounded-full border border-white/30 bg-white/10 backdrop-blur text-white flex items-center justify-center"
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

      {/* Drop-down móvil */}
      {open && (
        <div className="md:hidden mx-4 rounded-2xl bg-white/95 backdrop-blur border border-white/30 shadow-xl p-2">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-cream-100 rounded-xl"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
