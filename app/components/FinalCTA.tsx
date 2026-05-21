import Image from "next/image";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-900 text-white">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=2000&q=80"
          alt="Verduras y frutas frescas"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink-900/55" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">
          Empieza hoy
        </p>
        <h2 className="font-serif-display mt-4 text-3xl sm:text-5xl lg:text-6xl font-medium leading-tight uppercase">
          Da el primer
          <br />
          paso hacia
          <br />
          tu bienestar
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-sm sm:text-base text-white/80">
          Cada consulta es un paso hacia una vida más sana. Sin dietas
          imposibles, sin restricciones extremas. Solo nutrición real y
          adaptada a ti.
        </p>

        <div className="mt-10">
          <Link
            href="/agendar"
            className="inline-flex items-center gap-3 rounded-full bg-gray-900/80 backdrop-blur border border-white/10 pl-2 pr-5 py-2 text-sm font-medium text-white hover:bg-gray-900 transition-colors"
          >
            <span className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </span>
            AGENDAR MI CONSULTA
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
