"use client";

import Image from "next/image";
import Link from "next/link";
import { Blob, Squiggle } from "./decor";
import { useT } from "../lib/i18n";

export function Hero() {
  const t = useT();
  return (
    <section id="inicio" className="relative isolate overflow-hidden bg-cream-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-16 sm:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Texto */}
        <div className="order-2 lg:order-1">
          <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.05] text-ink-900">
            {t.hero.titleLead}
            <br />
            <span className="italic text-brand-600">{t.hero.titleEmphasis}</span>
          </h1>

          <p className="mt-6 max-w-md text-base sm:text-lg text-ink-500 leading-relaxed">
            {t.hero.paragraph}
          </p>

          <p className="mt-6 font-serif-display italic text-lg text-ink-700">
            {t.hero.italic}
          </p>

          <Squiggle className="mt-4 w-44 h-12" />

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/agendar"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-400 hover:bg-brand-500 px-7 py-3.5 text-sm font-medium text-white transition-colors uppercase tracking-wide"
            >
              {t.hero.ctaPrimary}
            </Link>
            <Link
              href="/como-funciona"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-300 bg-white px-7 py-3.5 text-sm font-medium text-ink-800 hover:border-brand-500 transition-colors"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Imagen + blob */}
        <div className="order-1 lg:order-2 relative flex justify-center">
          <Blob
            className="absolute -z-10 w-[115%] max-w-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            fill="var(--color-brand-200)"
          />
          <div className="relative aspect-[4/5] w-72 sm:w-96 rounded-[2.5rem] overflow-hidden shadow-xl">
            <Image
              src="/holasoynutricionista.png"
              alt={t.hero.imageAlt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
