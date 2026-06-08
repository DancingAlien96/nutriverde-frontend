import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "../lib/data";

export function Services() {
  return (
    <section id="servicios" className="bg-cream-50 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600">
            Servicios
          </p>
          <h2 className="font-serif-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-ink-900">
            Lo que ofrezco <span className="italic">para ti</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-500 leading-relaxed">
            Cada consulta está diseñada para adaptarse a tus necesidades, ritmo
            de vida y objetivos personales.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {SERVICES.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/agendar"
            className="inline-flex items-center gap-2 rounded-full bg-ink-900 hover:bg-ink-800 px-7 py-3.5 text-sm font-medium text-white transition-colors"
          >
            Reservar ahora
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: (typeof SERVICES)[number] }) {
  return (
    <article className="group bg-white rounded-3xl border border-cream-200 overflow-hidden hover:border-brand-300 transition-colors">
      <div className="relative aspect-[4/3] bg-cream-100">
        <Image
          src={service.image}
          alt={service.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {service.duration}
          </span>
          <p className="font-serif-display text-2xl text-brand-700">
            {service.price}
          </p>
        </div>

        <h3 className="font-serif-display mt-3 text-xl text-ink-900">
          {service.name}
        </h3>
        <p className="mt-2 text-sm text-ink-500 leading-relaxed line-clamp-3">
          {service.description}
        </p>

        {service.features.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-cream-200 pt-4">
            {service.features.map((f) => (
              <li
                key={f}
                className="text-xs text-ink-700 flex items-center gap-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
