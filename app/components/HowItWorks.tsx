"use client";

import { useT } from "../lib/i18n";

// Iconos por paso
function StepIcon({ index }: { index: number }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (index) {
    case 0: // formulario
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case 1: // pago / check
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l3 3 5-5" />
        </svg>
      );
    case 2: // horario / calendario
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v4M16 3v4" />
        </svg>
      );
    case 3: // consulta online / cámara
      return (
        <svg {...common}>
          <rect x="3" y="6" width="13" height="12" rx="2" />
          <path d="M16 10l5-3v10l-5-3" />
        </svg>
      );
    default: // plan / documento
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
      );
  }
}

export function HowItWorks() {
  const t = useT();
  return (
    <section
      id="como-funciona"
      className="bg-cream-50 py-16 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-widest-2 text-brand-600">
            {t.howItWorks.eyebrow}
          </p>
          <h2 className="font-serif-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-ink-900">
            {t.howItWorks.titleLead}{" "}
            <span className="italic text-brand-600">{t.howItWorks.titleEmphasis}</span>
          </h2>
        </div>

        <div className="mt-12 sm:mt-16 relative">
          {/* Línea punteada conectora (solo desktop) */}
          <div
            className="hidden lg:block absolute top-7 left-[10%] right-[10%] border-t-2 border-dashed border-brand-300"
            aria-hidden
          />

          <ol className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10">
            {t.howItWorks.steps.map((step, i) => (
              <li key={step.number} className="relative text-center">
                <span className="relative z-10 mx-auto h-14 w-14 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center ring-8 ring-cream-50">
                  <StepIcon index={i} />
                </span>
                <p className="mt-4 font-serif-display text-lg text-brand-600">
                  {step.number}
                </p>
                <h3 className="mt-1 font-medium text-sm text-ink-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-ink-500 leading-relaxed max-w-[12rem] mx-auto">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
