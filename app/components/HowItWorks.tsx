import { PROCESS_STEPS, PROCESS_FEATURES } from "../lib/data";

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-ink-900 py-20 lg:py-28 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">
            Proceso
          </p>
          <h2 className="font-serif-display mt-3 text-4xl sm:text-5xl font-medium leading-tight">
            Cómo funciona
            <br />
            tu consulta
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-white/70">
            Un proceso simple, claro y diseñado para que tu experiencia sea
            cómoda desde el primer momento.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PROCESS_STEPS.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl bg-ink-800 border border-white/5 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif-display text-2xl text-white/90">
                  {step.number}
                </span>
                <span className="h-8 w-8 rounded-lg bg-brand-500/15 text-brand-300 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                </span>
              </div>
              <h3 className="mt-6 font-semibold text-sm">{step.title}</h3>
              <p className="mt-2 text-xs text-white/65 leading-relaxed">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <ul className="mt-12 flex flex-wrap justify-center gap-3">
          {PROCESS_FEATURES.map((f) => (
            <li
              key={f.label}
              className="inline-flex items-center gap-2 rounded-full bg-ink-800 border border-white/10 px-4 py-2 text-xs text-white/85"
            >
              <span aria-hidden>{f.icon}</span>
              {f.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
