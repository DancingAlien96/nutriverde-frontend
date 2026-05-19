import Link from "next/link";
import { NAV_LINKS } from "../lib/data";

export function Header() {
  return (
    <header className="absolute top-0 inset-x-0 z-20">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif-display text-2xl text-white drop-shadow-sm"
        >
          NutriVerde
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/agendar"
          className="rounded-full border border-white/30 bg-white/10 backdrop-blur px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
        >
          Agendar consulta
        </Link>
      </nav>
    </header>
  );
}
