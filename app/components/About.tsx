import Image from "next/image";
import { SPECIALTIES } from "../lib/data";

export function About() {
  return (
    <section id="sobre-mi" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Imagen + badge */}
        <div className="relative">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80"
              alt="Nutricionista certificada"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="absolute -bottom-4 right-4 lg:right-8 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3 max-w-[260px]">
            <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-700">
                <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Nutricionista Certificada
              </p>
              <p className="text-xs text-gray-500">Colegiada · Guatemala</p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Sobre mí
          </p>
          <h2 className="font-serif-display mt-3 text-4xl sm:text-5xl font-medium leading-tight text-gray-900">
            Nutrición con
            <br />
            propósito
          </h2>

          <div className="mt-6 space-y-4 text-gray-700">
            <p>
              Soy nutricionista certificada con más de 5 años de experiencia
              ayudando a personas a transformar su relación con la
              alimentación. Mi enfoque es{" "}
              <strong>práctico, personalizado y sin extremos.</strong>
            </p>
            <p>
              Creo que comer bien no tiene que ser complicado. Trabajo contigo
              para diseñar un plan adaptado a tu vida real: tu familia, tu
              presupuesto, tus tiempos y tus gustos.
            </p>
          </div>

          <ul className="mt-8 grid sm:grid-cols-2 gap-3">
            {SPECIALTIES.map((s) => (
              <li
                key={s.label}
                className="flex items-center gap-3 rounded-xl bg-cream-100 px-4 py-3"
              >
                <span className="text-lg" aria-hidden>
                  {s.icon}
                </span>
                <span className="text-sm font-medium text-brand-800">
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
