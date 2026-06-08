import Image from "next/image";
import { SPECIALTIES } from "../lib/data";

export function About() {
  return (
    <section id="sobre-mi" className="bg-white py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Imagen circular tipo Carov */}
        <div className="relative flex justify-center lg:justify-start">
          <div className="relative aspect-square w-72 sm:w-96 rounded-full overflow-hidden border-[10px] border-cream-100 shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80"
              alt="Dulce Menzel, nutricionista clínica"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Contenido */}
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600">
            Conoce a tu nutricionista
          </p>
          <h2 className="font-serif-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-ink-900">
            Dulce <span className="italic">Menzel</span>
          </h2>
          <p className="mt-2 text-sm text-brand-700 font-medium">
            Nutricionista Clínica · MSc. Coaching Nutricional
          </p>

          <div className="mt-6 space-y-4 text-ink-700 leading-relaxed">
            <p>
              Nutricionista clínica graduada <strong className="text-ink-900">Cum Laude</strong> de
              la Universidad del Valle de Guatemala (UVG), con una Maestría en
              Coaching Nutricional y Nuevos Enfoques de Atención avalada por la
              Universidad de Barcelona. Cuento con formación en nutrición
              deportiva y abordaje nutricional para niños con trastorno del
              espectro autista (TEA).
            </p>
            <p>
              Mi enfoque combina <strong className="text-ink-900">evidencia
              científica, educación nutricional y hábitos sostenibles</strong> para
              ayudarte a alcanzar tus objetivos de salud, composición corporal y
              rendimiento de una manera práctica y personalizada.
            </p>
            <p className="text-sm text-ink-500">Idiomas: Español e Inglés.</p>
          </div>

          <ul className="mt-8 grid sm:grid-cols-2 gap-2.5">
            {SPECIALTIES.map((s) => (
              <li
                key={s.label}
                className="flex items-center gap-3 rounded-2xl bg-cream-50 border border-cream-200 px-4 py-3"
              >
                <span className="text-base" aria-hidden>
                  {s.icon}
                </span>
                <span className="text-sm font-medium text-ink-700">
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
