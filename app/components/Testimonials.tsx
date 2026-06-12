"use client";

import { useState } from "react";
import Image from "next/image";
import { useT } from "../lib/i18n";

const PER_PAGE = 3;

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5 text-brand-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < n ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  const t = useT();
  const all = t.testimonials.items;
  const pageCount = Math.ceil(all.length / PER_PAGE);
  const [page, setPage] = useState(0);
  const visible = all.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section
      id="testimonios"
      className="relative isolate overflow-hidden bg-cream-100 py-16 sm:py-24 lg:py-28"
    >
      {/* Jarrón grande que sangra por el borde derecho (como el diseño) */}
      <Image
        src="/jarron.png"
        alt=""
        width={600}
        height={600}
        aria-hidden
        className="pointer-events-none absolute -right-6 top-4 w-28 sm:w-40 lg:top-16 lg:-right-10 lg:w-80 xl:-right-4 xl:w-[26rem] object-contain z-0"
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest-2 text-brand-600">
            {t.testimonials.eyebrow}
          </p>
          <h2 className="font-serif-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-ink-900">
            {t.testimonials.titleLead}
            <br />
            <span className="italic text-brand-600">{t.testimonials.titleEmphasis}</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-500 leading-relaxed">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {visible.map((item) => (
            <article
              key={item.name}
              className="bg-cream-50 rounded-3xl border border-cream-200 p-6 flex flex-col"
            >
              <Stars n={item.rating} />
              <blockquote className="mt-4 text-sm text-ink-700 leading-relaxed flex-1">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-cream-200 pt-4">
                <Image
                  src={item.avatar}
                  alt={item.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-ink-900">{item.name}</p>
                  <p className="text-xs text-ink-500">{item.location}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {pageCount > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`Página ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === page ? "w-7 bg-brand-500" : "w-2 bg-brand-200"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
