"use client";

import { useState } from "react";
import Image from "next/image";
import { TESTIMONIALS } from "../lib/data";

export function Testimonials() {
  const [active, setActive] = useState(0);
  const featured = TESTIMONIALS[active];

  return (
    <section id="testimonios" className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600">
            Testimonios
          </p>
          <h2 className="font-serif-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-medium text-ink-900">
            Lo que dicen <span className="italic">mis pacientes</span>
          </h2>
        </div>

        <div className="mt-12 sm:mt-16 grid lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Featured */}
          <article className="lg:col-span-3 rounded-3xl bg-cream-50 border border-cream-200 p-6 sm:p-10 flex flex-col">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {featured.rating.toFixed(1)} · {featured.plan}
              </span>
            </div>

            <blockquote className="mt-6 font-serif-display text-lg sm:text-xl lg:text-2xl leading-snug text-ink-900">
              &ldquo;{featured.quote}&rdquo;
            </blockquote>

            {featured.result && (
              <div className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-white border border-cream-200 px-3 py-1.5 text-xs font-medium text-brand-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M18 17l-5-5-4 4-3-3" />
                </svg>
                {featured.result}
              </div>
            )}

            <div className="mt-auto pt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={featured.avatar}
                  alt={featured.name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover h-11 w-11"
                />
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {featured.name}
                  </p>
                  <p className="text-xs text-ink-500">{featured.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActive(
                      (active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
                    )
                  }
                  className="h-9 w-9 rounded-full border border-cream-300 flex items-center justify-center text-ink-700 hover:bg-white transition-colors"
                  aria-label="Anterior"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setActive((active + 1) % TESTIMONIALS.length)}
                  className="h-9 w-9 rounded-full bg-ink-900 text-white flex items-center justify-center hover:bg-ink-800 transition-colors"
                  aria-label="Siguiente"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Dots */}
            <div className="mt-4 flex items-center gap-1.5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? "w-8 bg-brand-600" : "w-1.5 bg-cream-300"
                  }`}
                  aria-label={`Testimonio ${i + 1}`}
                />
              ))}
            </div>
          </article>

          {/* Lista */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 content-start">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setActive(i)}
                className={`text-left rounded-2xl p-5 border transition-colors ${
                  i === active
                    ? "bg-brand-500 border-brand-500 text-white"
                    : "bg-cream-50 border-cream-200 text-ink-900 hover:border-brand-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover h-8 w-8"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{t.name}</p>
                    <p
                      className={`text-xs truncate ${
                        i === active ? "text-white/80" : "text-ink-500"
                      }`}
                    >
                      {t.location}
                    </p>
                  </div>
                </div>
                <p
                  className={`mt-3 text-xs leading-relaxed line-clamp-4 ${
                    i === active ? "text-white/90" : "text-ink-700"
                  }`}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
