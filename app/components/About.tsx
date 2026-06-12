"use client";

import Image from "next/image";
import { Blob, Squiggle } from "./decor";
import { useT } from "../lib/i18n";

export function About() {
  const t = useT();
  return (
    <section
      id="sobre-mi"
      className="relative isolate overflow-hidden bg-cream-50 py-16 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Imagen + blob */}
        <div className="order-1 relative flex justify-center">
          <Blob
            className="absolute -z-10 w-[115%] max-w-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            fill="var(--color-brand-200)"
          />
          <div className="relative aspect-[4/5] w-72 sm:w-96 rounded-[2.5rem] overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80"
              alt={t.about.photoAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="order-2">
          <p className="text-xs font-medium uppercase tracking-widest-2 text-brand-600">
            {t.about.eyebrow}
          </p>
          <h2 className="font-serif-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-ink-900">
            {t.about.name}
          </h2>
          <p className="mt-2 text-sm text-brand-700 font-medium">{t.about.role}</p>

          <div className="mt-6 space-y-4 text-ink-700 leading-relaxed">
            {t.about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <p className="mt-5 font-serif-display italic text-ink-700">
            {t.about.languages}
          </p>
          <Squiggle className="mt-3 w-40 h-10" />

          <ul className="mt-8 grid sm:grid-cols-2 gap-2.5">
            {t.about.specialties.map((s) => (
              <li
                key={s.label}
                className="flex items-center gap-3 rounded-2xl bg-cream-100 border border-cream-200 px-4 py-3"
              >
                <span className="text-base" aria-hidden>
                  {s.icon}
                </span>
                <span className="text-sm font-medium text-ink-700">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
