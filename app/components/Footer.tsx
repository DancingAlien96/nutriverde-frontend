"use client";

import Link from "next/link";
import { Wave } from "./decor";
import { useT } from "../lib/i18n";

export function Footer() {
  const t = useT();
  return (
    <footer className="relative">
      {/* Onda sage que conecta con la sección anterior */}
      <div className="relative h-16 sm:h-24 bg-cream-50">
        <Wave
          className="absolute bottom-0 left-0 w-full h-16 sm:h-24"
          fill="var(--color-brand-300)"
        />
      </div>

      {/* Banda final sage */}
      <div className="bg-brand-300">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-10 pt-2 text-center">
          <Link href="/" className="inline-block leading-none">
            <span className="block font-serif-display text-3xl tracking-[0.08em] text-brand-900">
              PLENHA
            </span>
            <span className="block text-[9px] tracking-widest-2 uppercase text-brand-800/70 mt-1">
              {t.footer.tagline}
            </span>
          </Link>

          <p className="mt-6 text-xs text-brand-900/60">
            <span aria-hidden>📍</span> {t.footer.location}
          </p>
          <p className="mt-0.5 text-xs text-brand-900/60">{t.footer.worldwide}</p>
          <p className="mt-3 text-xs text-brand-900/50">
            © {new Date().getFullYear()} {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
