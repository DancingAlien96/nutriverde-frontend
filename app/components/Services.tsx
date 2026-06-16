"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Blob, LeafIcon } from "./decor";
import { useLocale } from "../lib/i18n";
import {
  fetchServices,
  localizedService,
  backendImageSrc,
  type ApiService,
} from "../lib/api";

// Imágenes por slug (la BD no guarda imágenes de marketing).
const SERVICE_IMAGES: Record<string, string> = {
  "consulta-inicial": "/consultainicial.png",
  "consulta-seguimiento": "/consultaseguimiento.png",
  "coaching-nutricional": "/coachingnutricional.png",
  "nutricion-deportiva": "/nutriciondeportiva.png",
};
const FALLBACK_IMAGE = "/consultainicial.png";

// Icono por servicio (según orden)
function ServiceIcon({ index }: { index: number }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (index) {
    case 0: // Consulta inicial — persona
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 12 0v1" />
        </svg>
      );
    case 1: // Seguimiento — gráfica
      return (
        <svg {...common}>
          <path d="M3 17l5-5 4 4 8-8" />
          <path d="M16 8h5v5" />
        </svg>
      );
    case 2: // Coaching — hoja
      return <LeafIcon className="w-[18px] h-[18px]" />;
    default: // Deportiva — pesa
      return (
        <svg {...common}>
          <path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12" />
        </svg>
      );
  }
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
      <Blob
        className="absolute -top-24 -right-28 w-80 -z-10 opacity-70"
        fill="var(--color-brand-100)"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest-2 text-brand-600">
            {t.services.eyebrow}
          </p>
          <h2 className="font-serif-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-ink-900">
            {t.services.titleLead}
            <br />
            <span className="italic text-brand-600">{t.services.titleEmphasis}</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-500 leading-relaxed">
            {t.services.subtitle}
          </p>
        </div>

        <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {services === null
            ? // Esqueletos mientras carga
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-cream-50 rounded-3xl border border-cream-200 h-72 animate-pulse"
                />
              ))
            : services.map((service, i) => {
                // Traducción auto-generada en la BD según el idioma activo.
                const loc = localizedService(service, locale);
                return (
                  <ServiceCard
                    key={service.slug}
                    service={service}
                    index={i}
                    name={loc.name}
                    description={loc.description}
                    monthlyLabel={t.agendar.service.monthly}
                  />
                );
              })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <Link
            href="/agendar"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-400 hover:bg-brand-500 px-7 py-3.5 text-sm font-medium text-white transition-colors uppercase tracking-wide"
          >
            {t.services.cta}
          </Link>
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest-2 text-ink-500">
            <LeafIcon className="w-4 h-4 text-brand-500" />
            {t.services.online}
          </p>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  index,
  name,
  description,
  monthlyLabel,
}: {
  service: ApiService;
  index: number;
  name: string;
  description: string;
  monthlyLabel: string;
}) {
  const image =
    backendImageSrc(service.imageUrl) ??
    SERVICE_IMAGES[service.slug] ??
    FALLBACK_IMAGE;
  const meta =
    service.billingType === "MONTHLY"
      ? monthlyLabel
      : `${service.durationMin} min`;
  return (
    <article className="bg-cream-50 rounded-3xl border border-cream-200 text-center pb-6 hover:shadow-md transition-shadow">
      {/* Imagen redondeada con círculo-ícono superpuesto */}
      <div className="relative px-4 pt-4">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brand-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <span className="absolute left-1/2 -bottom-5 -translate-x-1/2 h-11 w-11 rounded-full bg-brand-400 text-white flex items-center justify-center shadow-md ring-4 ring-cream-50">
          <ServiceIcon index={index} />
        </span>
      </div>

      <div className="px-5 pt-9">
        <h3 className="font-serif-display text-lg text-ink-900">{name}</h3>
        <p className="mt-2 text-xs text-ink-500 leading-relaxed">
          {description}
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          {meta}
          {service.priceCents > 0 && (
            <span className="font-medium"> · {service.priceFormatted}</span>
          )}
        </p>
      </div>
    </article>
  );
}
