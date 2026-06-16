"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "../lib/i18n";

export function Hero() {
  const t = useT();
  return (
    <section id="inicio" className="relative isolate overflow-hidden bg-cream-50">
      {/* Foto de fondo (todos los tamaños, se redimensiona) */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/home.jpg"
          alt={t.hero.imageAlt}
          fill
          priority
          className="object-cover object-[28%_center] lg:object-center"
          sizes="100vw"
        />
        {/* Imagen pura en todos los tamaños; el texto usa sombra para
            legibilidad sobre la zona clara del mantel. */}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 lg:pt-40 pb-20 lg:pb-32 min-h-[88vh] sm:min-h-[80vh] lg:min-h-[82vh] flex flex-col justify-center">
        <div className="max-w-[17rem] sm:max-w-md lg:max-w-xl [text-shadow:0_1px_16px_rgba(248,244,234,0.95)]">
          <span className="block h-px w-10 bg-ink-300 mb-6" aria-hidden />
          <h1 className="font-serif-display text-[2rem] leading-[1.1] sm:text-5xl lg:text-[3.4rem] sm:leading-[1.08] font-medium text-ink-900">
            {t.hero.titleLead}{" "}
            <span className="italic text-brand-600">{t.hero.titleEmphasis}</span>
          </h1>
          <p className="mt-5 sm:mt-6 max-w-md text-sm sm:text-base lg:text-lg text-ink-700 leading-relaxed">
            {t.hero.paragraph}
          </p>
          <div className="mt-7 sm:mt-8">
            <Link
              href="/agendar"
              className="inline-flex items-center justify-center rounded-full bg-brand-400 hover:bg-brand-500 px-7 sm:px-8 py-3.5 text-sm font-medium text-white transition-colors uppercase tracking-wide"
            >
              {t.hero.ctaPrimary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
