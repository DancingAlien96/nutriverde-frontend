"use client";

import Link from "next/link";
import type { ApiService, Region } from "../lib/api";
import { IntakeForm } from "./IntakeForm";
import { useT } from "../lib/i18n";

export function AgendarClient({
  services,
  initialRegion,
}: {
  services: ApiService[];
  initialRegion?: Region;
}) {
  const t = useT();
  return (
    <main className="min-h-screen bg-cream-50 flex-1">
      <header className="border-b border-cream-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between gap-3">
          <Link href="/" className="font-serif-display text-xl sm:text-2xl text-gray-900">
            Plenha
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t.agendar.page.back}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-6 sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {t.agendar.page.eyebrow}
          </p>
          <h1 className="font-serif-display mt-3 text-3xl sm:text-4xl lg:text-5xl text-gray-900">
            {t.agendar.page.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-md mx-auto">
            {t.agendar.page.subtitle}
          </p>
        </div>

        <IntakeForm services={services} initialRegion={initialRegion} />

        <p className="mt-8 text-center text-xs text-gray-500">
          {t.agendar.page.troublePrefix}{" "}
          <a
            href="mailto:hola@plenhanutrition.com"
            className="text-brand-700 hover:underline"
          >
            {t.agendar.page.troubleLink}
          </a>
          .
        </p>
      </div>
    </main>
  );
}

export function AgendarError() {
  const t = useT();
  return (
    <main className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md text-center">
        <h1 className="font-serif-display text-2xl text-gray-900">
          {t.agendar.page.errorTitle}
        </h1>
        <p className="mt-3 text-sm text-gray-600">{t.agendar.page.errorBody}</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          ← {t.agendar.page.backHome}
        </Link>
      </div>
    </main>
  );
}
