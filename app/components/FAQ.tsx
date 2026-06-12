"use client";

import { useState } from "react";
import Image from "next/image";
import { useT } from "../lib/i18n";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = useT();

  return (
    <section
      id="faq"
      className="relative isolate overflow-hidden bg-cream-50 py-16 sm:py-24 lg:py-28"
    >
      {/* Foto decorativa que se funde con el fondo crema */}
      <Image
        src="/preguntasfrecuentes.png"
        alt=""
        width={520}
        height={520}
        aria-hidden
        className="pointer-events-none hidden md:block absolute -top-4 right-0 lg:right-8 w-72 lg:w-[24rem] h-auto object-contain z-0"
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md">
          <p className="text-xs font-medium uppercase tracking-widest-2 text-brand-600">
            {t.faq.eyebrow}
          </p>
          <h2 className="font-serif-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-ink-900">
            {t.faq.titleLead}
            <br />
            <span className="italic text-brand-600">{t.faq.titleEmphasis}</span>
          </h2>
          <p className="mt-4 max-w-sm text-sm text-ink-500 leading-relaxed">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="mt-10 max-w-3xl space-y-3">
          {t.faq.items.map((faq, i) => {
            const isOpen = i === openIndex;
            return (
              <div
                key={faq.question}
                className={`rounded-2xl border transition-colors ${
                  isOpen
                    ? "bg-white border-brand-200"
                    : "bg-cream-100 border-cream-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-sm font-medium ${
                      isOpen ? "text-brand-700" : "text-ink-800"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? "bg-brand-100 text-brand-700"
                        : "bg-white text-ink-500"
                    }`}
                  >
                    {isOpen ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-ink-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
