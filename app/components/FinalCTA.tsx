import Image from "next/image";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-cream-100 px-6 sm:px-12 py-16 sm:py-20 text-center">
          {/* Decoraciones */}
          <div className="pointer-events-none absolute -top-12 -left-12 w-44 sm:w-56 opacity-90">
            <Image
              src="https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&w=600&q=80"
              alt=""
              width={400}
              height={400}
              className="rounded-full object-cover aspect-square"
            />
          </div>
          <div className="pointer-events-none absolute -bottom-12 -right-12 w-44 sm:w-56 opacity-90">
            <Image
              src="https://images.unsplash.com/photo-1597474561103-0270e2c8a37e?auto=format&fit=crop&w=600&q=80"
              alt=""
              width={400}
              height={400}
              className="rounded-full object-cover aspect-square"
            />
          </div>

          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600">
              Empieza hoy
            </p>
            <h2 className="font-serif-display mt-4 text-3xl sm:text-5xl lg:text-6xl font-medium leading-tight text-ink-900">
              Da el primer paso
              <br />
              hacia <span className="italic">tu bienestar</span>
            </h2>
            <p className="mt-6 max-w-xl mx-auto text-sm sm:text-base text-ink-500">
              Cada consulta es un paso hacia una vida más sana. Sin dietas
              imposibles, sin restricciones extremas. Solo nutrición real y
              adaptada a ti.
            </p>

            <div className="mt-10">
              <Link
                href="/agendar"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 hover:bg-ink-800 px-8 py-3.5 text-sm font-medium text-white transition-colors"
              >
                Agendar mi consulta
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
