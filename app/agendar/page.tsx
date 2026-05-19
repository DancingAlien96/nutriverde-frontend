import Link from "next/link";
import { fetchServices } from "../lib/api";
import { IntakeForm } from "./IntakeForm";

export const metadata = {
  title: "Agendar consulta — NutriVerde",
};

export default async function AgendarPage() {
  let services;
  try {
    services = await fetchServices();
  } catch {
    return <ErrorState />;
  }

  return (
    <main className="min-h-screen bg-cream-50 flex-1">
      <header className="border-b border-cream-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="font-serif-display text-2xl text-gray-900">
            NutriVerde
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Agendar consulta
          </p>
          <h1 className="font-serif-display mt-3 text-4xl sm:text-5xl text-gray-900">
            Comencemos juntas
          </h1>
          <p className="mt-3 text-gray-600 max-w-md mx-auto">
            Tres pasos sencillos: elige tu servicio, cuéntanos sobre ti y sube
            tu comprobante.
          </p>
        </div>

        <IntakeForm services={services} />

        <p className="mt-8 text-center text-xs text-gray-500">
          ¿Tienes problemas?{" "}
          <a
            href="mailto:hola@nutriverde.com"
            className="text-brand-700 hover:underline"
          >
            Escríbenos
          </a>
          .
        </p>
      </div>
    </main>
  );
}

function ErrorState() {
  return (
    <main className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md text-center">
        <h1 className="font-serif-display text-2xl text-gray-900">
          No pudimos cargar los servicios
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Verifica tu conexión o intenta de nuevo en unos minutos. Si el
          problema persiste, escríbenos a hola@nutriverde.com.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
