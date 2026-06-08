import Link from "next/link";
import { NAV_LINKS, SITE } from "../lib/data";

export function Footer() {
  return (
    <footer className="bg-ink-900 text-cream-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10">
          <div className="col-span-2 lg:col-span-4">
            <Link
              href="/"
              className="font-serif-display text-2xl text-cream-50"
            >
              {SITE.name}
            </Link>
            <p className="mt-4 text-sm text-cream-200/70 max-w-xs leading-relaxed">
              Consultas nutricionales online personalizadas. Tu bienestar,
              desde donde estés.
            </p>
            <p className="mt-6 flex items-center gap-2 text-xs text-cream-200/50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {SITE.location}
            </p>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-300">
              Navegación
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream-200/80">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-cream-50 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/agendar" className="hover:text-cream-50 transition-colors">
                  Agendar consulta
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-300">
              Redes sociales
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream-200/80">
              <li>
                <a
                  href={SITE.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-cream-50 transition-colors"
                >
                  <SocialIcon name="instagram" /> Instagram
                </a>
              </li>
              <li>
                <a
                  href={SITE.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-cream-50 transition-colors"
                >
                  <SocialIcon name="facebook" /> Facebook
                </a>
              </li>
              <li>
                <a
                  href={SITE.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-cream-50 transition-colors"
                >
                  <SocialIcon name="whatsapp" /> WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-2 hover:text-cream-50 transition-colors"
                >
                  <SocialIcon name="email" /> {SITE.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-brand-300">
              ¿Lista para comenzar?
            </h3>
            <p className="mt-4 text-sm text-cream-200/80">
              Agenda tu consulta hoy. Proceso simple y rápido.
            </p>
            <Link
              href="/agendar"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-cream-50 hover:bg-cream-100 px-6 py-3 text-sm font-medium text-ink-900 w-full transition-colors"
            >
              Agendar consulta
            </Link>
            <p className="mt-3 text-xs text-cream-200/50 inline-flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Acceso privado por referencia
            </p>
          </div>
        </div>

        <div className="mt-10 sm:mt-16 pt-6 border-t border-cream-50/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-200/50 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Plenha Nutrition. Todos los derechos reservados.</p>
          <p>Dulce Menzel · Nutricionista clínica · Guatemala</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: "instagram" | "facebook" | "whatsapp" | "email" }) {
  switch (name) {
    case "instagram":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
        </svg>
      );
    case "facebook":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    case "email":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
  }
}
