import { PROCESS_STEPS, PROCESS_FEATURES } from "../lib/data";

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-ink-900 py-16 sm:py-24 lg:py-32 text-cream-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-300">
            Proceso
          </p>
          <h2 className="font-serif-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight">
            Cómo funciona <span className="italic">tu consulta</span>
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-sm sm:text-base text-cream-200/80">
            Un proceso simple, claro y diseñado para que tu experiencia sea
            cómoda desde el primer momento.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {PROCESS_STEPS.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl bg-ink-800/70 border border-cream-50/10 p-5"
            >
              <span className="font-serif-display text-xl text-brand-300">
                {step.number}
              </span>
              <h3 className="mt-4 font-medium text-sm text-cream-50">
                {step.title}
              </h3>
              <p className="mt-2 text-xs text-cream-200/70 leading-relaxed">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <ul className="mt-12 flex flex-wrap justify-center gap-2 sm:gap-3">
          {PROCESS_FEATURES.map((f) => (
            <li
              key={f.label}
              className="inline-flex items-center gap-2 rounded-full bg-ink-800/70 border border-cream-50/10 px-4 py-2 text-xs text-cream-100"
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
