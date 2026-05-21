"use client";

import { useState } from "react";
import Image from "next/image";
import { TESTIMONIALS } from "../lib/data";

export function Testimonials() {
  const [active, setActive] = useState(0);
  const featured = TESTIMONIALS[active];

  return (
    <section id="testimonios" className="bg-cream-50 py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Testimonios
          </p>
          <h2 className="font-serif-display mt-3 text-2xl sm:text-4xl lg:text-5xl font-medium text-gray-900">
            ( Lo que dicen mis pacientes )
          </h2>
        </div>

        <div className="mt-10 sm:mt-14 grid lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Featured */}
          <article className="lg:col-span-3 rounded-2xl bg-white border border-gray-100 p-5 sm:p-8 lg:p-10 shadow-sm flex flex-col">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-xs text-white">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-300">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {featured.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">{featured.plan}</span>
            </div>

            <blockquote className="mt-6 font-serif-display text-lg sm:text-xl lg:text-2xl leading-snug text-gray-900">
              &ldquo;{featured.quote}&rdquo;
            </blockquote>

            {featured.result && (
              <div className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-brand-50 border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700">
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
                  <p className="text-sm font-semibold text-gray-900">
                    {featured.name}
                  </p>
                  <p className="text-xs text-gray-500">{featured.location}</p>
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
                  className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                  aria-label="Anterior"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setActive((active + 1) % TESTIMONIALS.length)}
                  className="h-9 w-9 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
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
                    i === active ? "w-8 bg-brand-600" : "w-1.5 bg-gray-300"
                  }`}
                  aria-label={`Testimonio ${i + 1}`}
                />
              ))}
            </div>
          </article>

          {/* Lista */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 content-start">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setActive(i)}
                className={`text-left rounded-2xl p-5 border transition-all ${
                  i === active
                    ? "bg-brand-600 border-brand-600 text-white shadow-md"
                    : "bg-white border-gray-100 text-gray-900 hover:border-brand-200"
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
                        i === active ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {t.location}
                    </p>
                  </div>
                </div>
                <p
                  className={`mt-3 text-xs leading-relaxed line-clamp-4 ${
                    i === active ? "text-white/90" : "text-gray-600"
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
