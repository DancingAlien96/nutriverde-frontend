import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "../lib/data";

export function Services() {
  return (
    <section id="servicios" className="bg-cream-50 py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          Servicios
        </p>
        <h2 className="font-serif-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-gray-900 max-w-xl">
          Lo que ofrezco
          <br />
          para ti <span className="inline-block">🌿</span>
        </h2>
        <p className="mt-4 max-w-md text-sm sm:text-base text-gray-600">
          Cada consulta está diseñada para adaptarse a tus necesidades, ritmo
          de vida y objetivos personales.
        </p>

        <div className="mt-8 sm:mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {SERVICES.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/agendar"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Reservar ahora
          </Link>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: (typeof SERVICES)[number] }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-ink-900 aspect-[3/4] flex flex-col justify-end">
      <Image
        src={service.image}
        alt={service.name}
        fill
        className="object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      <div className="relative p-6 text-white">
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            {service.duration}
          </span>
        </div>

        <h3 className="font-serif-display mt-3 text-2xl font-medium">
          {service.name}
        </h3>
        <p className="mt-1 text-3xl font-serif-display text-brand-300">
          {service.price}
        </p>

        {service.highlighted && (
          <>
            <p className="mt-3 text-sm text-white/85 leading-relaxed">
              {service.description}
            </p>
            <ul className="mt-4 space-y-1.5">
              {service.features.map((f) => (
                <li
                  key={f}
                  className="text-xs text-white/90 flex items-center gap-2"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400 shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <button
        type="button"
        className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
        aria-label={`Más información sobre ${service.name}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </article>
  );
}
