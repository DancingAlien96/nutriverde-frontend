"use client";

import { useEffect, useState } from "react";
import { useLocale } from "../lib/i18n";
import { SITE } from "../lib/data";
import {
  fetchServices,
  localizedService,
  backendImageSrc,
  type ApiService,
} from "../lib/api";

// Imágenes por slug (respaldo si el servicio no tiene imagen subida).
const SERVICE_IMAGES: Record<string, string> = {
  "consulta-inicial": "/consultainicial.png",
  "consulta-seguimiento": "/consultaseguimiento.png",
  "coaching-nutricional": "/coachingnutricional.png",
  "nutricion-deportiva": "/nutriciondeportiva.png",
};
const FALLBACK_IMAGE = "/consultainicial.png";

const svg = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

function ServiceIcon({ index }: { index: number }) {
  switch (index) {
    case 0: // persona
      return (
        <svg {...svg} width="18" height="18">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 12 0v1" />
        </svg>
      );
    case 1: // calendario
      return (
        <svg {...svg} width="18" height="18">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v4M16 3v4" />
        </svg>
      );
    case 2: // hoja
      return (
        <svg {...svg} width="18" height="18">
          <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 9-4 16-9 16Z" />
          <path d="M4 13c5-1 9-3 12-7" />
        </svg>
      );
    default: // pesa
      return (
        <svg {...svg} width="18" height="18">
          <path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" />
        </svg>
      );
  }
}

function ClockIcon() {
  return (
    <svg {...svg} width="14" height="14" className="text-ink-400">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg {...svg} width="14" height="14" className="text-ink-400">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const p = { ...svg, width: 18, height: 18 };
  switch (name) {
    case "leaf":
      return (
        <svg {...p}>
          <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 9-4 16-9 16Z" />
          <path d="M4 13c5-1 9-3 12-7" />
        </svg>
      );
    case "person":
      return (
        <svg {...p}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 12 0v1" />
        </svg>
      );
    case "heart":
      return (
        <svg {...p}>
          <path d="M12 20s-7-4.4-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.6 12 20 12 20Z" />
        </svg>
      );
    case "globe":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
        </svg>
      );
    default: // pin
      return (
        <svg {...p}>
          <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
          <circle cx="12" cy="11" r="2.2" />
        </svg>
      );
  }
}

function Branch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 80"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 78C40 70 70 50 150 6" />
      <path d="M52 50c-10-6-12-16-8-26 10 4 14 14 8 26Z" />
      <path d="M86 33c-4-11-1-21 8-27 5 11 1 22-8 27Z" />
      <path d="M70 41c10-7 13-17 11-28-11 5-17 16-11 28Z" />
    </svg>
  );
}

export function Services() {
  const { t, locale } = useLocale();
  const [services, setServices] = useState<ApiService[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchServices()
      .then((s) => {
        if (!cancelled) setServices(s);
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="servicios"
      className="relative isolate overflow-hidden bg-cream-100 py-16 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest-2 text-brand-600">
            {t.services.eyebrow}
          </p>
          <h2 className="font-serif-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-ink-900">
            {t.services.titleLead}
            <br />
            <span className="italic text-brand-600">{t.services.titleEmphasis}</span>
          </h2>
          <p className="mt-5 text-sm sm:text-base text-ink-500 leading-relaxed">
            {t.services.subtitle}
          </p>
        </div>

        {/* Tarjetas */}
        <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {services === null
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-cream-50 rounded-3xl border border-cream-200 h-96 animate-pulse"
                />
              ))
            : services.map((service, i) => (
                <ServiceCard key={service.slug} service={service} index={i} />
              ))}
        </div>

        {/* Banda: no estás seguro */}
        <div className="mt-12 relative overflow-hidden rounded-3xl bg-cream-50 border border-cream-200 px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Branch className="hidden sm:block absolute left-2 bottom-1 h-24 w-auto text-brand-400/40" />
          <div className="relative text-center sm:text-left sm:pl-28">
            <p className="font-serif-display text-xl sm:text-2xl text-ink-900">
              {t.services.banner.question}
            </p>
            <p className="mt-1 text-sm text-ink-600">{t.services.banner.text}</p>
          </div>
          <a
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative shrink-0 inline-flex items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 px-7 py-3 text-sm font-medium text-white transition-colors"
          >
            {t.services.banner.cta}
          </a>
        </div>

        {/* Features */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-5">
          {t.services.features.map((f, i) => (
            <div
              key={f.key}
              className={`flex items-center justify-center gap-2 text-xs text-ink-600 px-3 ${
                i > 0 ? "lg:border-l lg:border-cream-300" : ""
              }`}
            >
              <span className="text-brand-600 shrink-0">
                <FeatureIcon name={f.key} />
              </span>
              <span className="text-center sm:text-left">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  index,
}: {
  service: ApiService;
  index: number;
}) {
  const { t, locale } = useLocale();
  const image =
    backendImageSrc(service.imageUrl) ??
    SERVICE_IMAGES[service.slug] ??
    FALLBACK_IMAGE;
  const loc = localizedService(service, locale);
  const card = t.services.cards[service.slug];
  const description = card?.description ?? loc.description;
  const perfectIfYou = card?.perfectIfYou;

  return (
    <article className="bg-cream-50 rounded-3xl border border-cream-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Imagen + ícono */}
      <div className="relative">
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={loc.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <span className="absolute left-6 -bottom-5 h-11 w-11 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md ring-4 ring-cream-50">
          <ServiceIcon index={index} />
        </span>
      </div>

      <div className="p-6 pt-9 flex flex-col flex-1">
        <h3 className="font-serif-display text-xl text-ink-900">{loc.name}</h3>
        <p className="mt-2 text-sm text-ink-600 leading-relaxed">{description}</p>

        {perfectIfYou && (
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
              {t.services.perfectLabel}
            </p>
            <p className="mt-1 text-sm text-ink-600 leading-relaxed">
              {perfectIfYou}
            </p>
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center gap-3 text-xs text-ink-500 border-t border-cream-200">
          <span className="inline-flex items-center gap-1.5 pt-4">
            <ClockIcon /> {service.durationMin} {t.services.minutes}
          </span>
          <span className="h-3 w-px bg-cream-300 mt-4" />
          <span className="inline-flex items-center gap-1.5 pt-4">
            <MonitorIcon /> {t.services.online}
          </span>
        </div>
      </div>
    </article>
  );
}
