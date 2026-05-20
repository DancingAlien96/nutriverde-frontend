import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-cream-100">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=2000&q=80"
          alt="Frutas y verduras frescas"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream-50/70 via-cream-50/30 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-32 pb-12 lg:pt-40 lg:pb-20 min-h-[680px] flex flex-col justify-center relative">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-brand-200 px-4 py-1.5 text-xs font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Consultas online disponibles
          </span>

          <h1 className="font-serif-display mt-6 text-5xl sm:text-6xl lg:text-7xl font-medium leading-[1.05] text-gray-900">
            Tu salud,
            <br />
            <span className="text-brand-600">guiada</span> por
            <br />
            una experta
          </h1>

          <p className="mt-6 max-w-md text-base text-gray-700">
            Consultas nutricionales personalizadas desde la comodidad de tu
            hogar. Plan de alimentación adaptado a tu estilo de vida y
            objetivos.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/agendar"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Agendar mi consulta
            </Link>
            <Link
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 backdrop-blur px-6 py-3.5 text-sm font-medium text-gray-900 hover:bg-white transition-colors"
            >
              Cómo funciona
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            <Stat value="+150" label="Pacientes atendidos" />
            <Stat value="5 años" label="De experiencia" />
            <Stat value="100%" label="Online y personalizado" />
          </dl>
        </div>
      </div>

    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-2xl font-serif-display font-medium text-gray-900">
        {value}
      </dt>
      <dd className="mt-1 text-xs text-gray-600">{label}</dd>
    </div>
  );
}
