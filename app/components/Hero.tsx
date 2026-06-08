import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-cream-50">
      {/* Decoraciones de frutas — esquinas */}
      <div className="pointer-events-none absolute top-24 -right-16 sm:right-0 w-40 sm:w-56 lg:w-72 opacity-90">
        <Image
          src="https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&w=600&q=80"
          alt=""
          width={600}
          height={600}
          className="rounded-full object-cover aspect-square"
        />
      </div>
      <div className="pointer-events-none hidden lg:block absolute bottom-12 -left-12 w-56 opacity-90">
        <Image
          src="https://images.unsplash.com/photo-1597474561103-0270e2c8a37e?auto=format&fit=crop&w=600&q=80"
          alt=""
          width={600}
          height={600}
          className="rounded-full object-cover aspect-square"
        />
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-8 pt-28 sm:pt-36 pb-16 sm:pb-24 lg:pb-32 text-center relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-white border border-blush-200 px-4 py-1.5 text-xs font-medium text-blush-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blush-400" />
          Asesoría nutricional online
        </span>

        <h1 className="font-serif-display mt-6 text-4xl sm:text-6xl lg:text-7xl font-medium leading-[1.05] text-ink-900 max-w-3xl mx-auto">
          Bienvenido a <span className="italic text-brand-600">Plenha</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-ink-500 leading-relaxed">
          Creemos que la mejor alimentación es aquella que puedes mantener en el
          tiempo. Con asesoría personalizada y basada en evidencia científica, te
          ayudamos a desarrollar hábitos sostenibles que se adaptan a tu estilo de
          vida, preferencias y objetivos.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link
            href="/agendar"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 hover:bg-ink-800 px-7 py-3.5 text-sm font-medium text-white transition-colors"
          >
            Agendar mi consulta
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/como-funciona"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-300/60 bg-white px-7 py-3.5 text-sm font-medium text-ink-800 hover:border-ink-700 transition-colors"
          >
            Cómo funciona
          </Link>
        </div>

        <dl className="mt-16 sm:mt-20 grid grid-cols-3 gap-6 sm:gap-12 max-w-xl mx-auto border-t border-cream-300 pt-8">
          <Stat value="+150" label="Pacientes atendidos" />
          <Stat value="5 años" label="De experiencia" />
          <Stat value="100%" label="Online y personalizado" />
        </dl>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <dt className="font-serif-display text-2xl sm:text-3xl text-ink-900">
        {value}
      </dt>
      <dd className="mt-1 text-[10px] sm:text-xs uppercase tracking-wider text-ink-500 leading-tight">
        {label}
      </dd>
    </div>
  );
}
