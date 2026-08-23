"use client";

import { useT } from "../lib/i18n";

export function About() {
  const t = useT();
  return (
    <section
      id="sobre-mi"
      className="relative isolate overflow-hidden bg-cream-50"
    >
      {/* Ramitas decorativas — enmarcan el bloque centrado y ocupan el aire
          que antes llenaba la foto. Solo desde lg para no apretar el texto. */}
      <Branch
        className="hidden lg:block absolute left-4 xl:left-12 top-1/2 -translate-y-1/2 h-52 w-auto text-brand-300/40"
      />
      <Branch
        className="hidden lg:block absolute right-4 xl:right-12 top-1/2 -translate-y-1/2 h-52 w-auto text-brand-300/40 -scale-x-100"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest-2 text-brand-600">
            {t.about.eyebrow}
          </p>
          <h2 className="font-serif-display mt-4 text-4xl sm:text-5xl lg:text-[3.25rem] font-medium leading-[1.08] text-ink-900">
            {t.about.greeting} {t.about.name}.
          </h2>
          <p className="mt-4 font-serif-display italic text-lg sm:text-xl text-ink-600">
            {t.about.role}
          </p>

          <span className="block h-px w-12 bg-ink-300 my-7 mx-auto" aria-hidden />

          <div className="mx-auto max-w-xl space-y-5 text-ink-600 leading-relaxed">
            {t.about.paragraphs.map((segments, i) => (
              <p key={i}>
                {segments.map((s, j) =>
                  s.hl ? (
                    <span key={j} className="text-brand-600 font-medium">
                      {s.text}
                    </span>
                  ) : (
                    <span key={j}>{s.text}</span>
                  ),
                )}
              </p>
            ))}
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-3 max-w-md mx-auto">
            {t.about.features.map((f, i) => (
              <div
                key={f.key}
                className={`flex flex-col items-center text-center px-2 sm:px-3 ${
                  i > 0 ? "border-l border-cream-300" : ""
                }`}
              >
                <span className="h-14 w-14 rounded-full bg-cream-200/70 text-ink-700 flex items-center justify-center">
                  <FeatureIcon name={f.key} />
                </span>
                <span className="mt-3 text-xs text-ink-600 leading-snug">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureIcon({ name }: { name: "leaf" | "plan" | "heart" }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "leaf") {
    return (
      <svg {...common}>
        <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 9-4 16-9 16Z" />
        <path d="M4 13c5-1 9-3 12-7" />
      </svg>
    );
  }
  if (name === "plan") {
    return (
      <svg {...common}>
        <path d="M4 13h16a8 8 0 0 1-16 0Z" />
        <path d="M12 13c0-3 1.5-5 4-6-0.5 2.5-2 4.5-4 6Z" />
        <path d="M12 13c0-2.5-1.2-4.3-3.5-5 .5 2.2 1.7 3.9 3.5 5Z" />
        <path d="M12 13V8" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 20s-7-4.4-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.6 12 20 12 20Z" />
    </svg>
  );
}

/** Ramita decorativa de olivo (line-art). */
function Branch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 200"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M40 198V20" />
      <path d="M40 60c-16 2-26-6-28-22 16-2 26 6 28 22Z" />
      <path d="M40 96c16 2 26-6 28-22-16-2-26 6-28 22Z" />
      <path d="M40 132c-16 2-26-6-28-22 16-2 26 6 28 22Z" />
      <path d="M40 40c12 1 19-5 21-17-12-1-19 5-21 17Z" />
    </svg>
  );
}
