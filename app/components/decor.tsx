/**
 * Formas decorativas orgánicas (blobs y ondas) que dan el look "Plenha".
 * Son SVG puros sin estado, fáciles de posicionar de forma absoluta.
 */

/** Blob orgánico relleno. Se posiciona con className desde el padre. */
export function Blob({
  className,
  fill = "var(--color-brand-200)",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        fill={fill}
        d="M444 96c54 38 96 96 110 162 14 66 0 140-40 196-40 56-106 94-176 100-70 6-144-20-196-68-52-48-82-118-78-186 4-68 42-134 98-172 56-38 130-48 196-32 24 6 62 0 86 0Z"
      />
    </svg>
  );
}

/**
 * Onda divisoria — el `fill` "pinta" hacia abajo, así que se coloca pegada al
 * borde inferior de una sección para que su color fluya hacia la siguiente.
 * Suave y orgánica, estilo Plenha.
 */
export function Wave({
  className,
  fill = "var(--color-brand-200)",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      viewBox="0 0 1440 140"
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        fill={fill}
        d="M0 70C160 18 360 8 540 40c180 32 320 80 540 78 160-2 300-38 360-58v82H0Z"
      />
    </svg>
  );
}

/** Línea curva decorativa tipo "squiggle". */
export function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 60"
      className={className}
      fill="none"
      aria-hidden
    >
      <path
        d="M4 40c30-40 60 20 90 0s50-50 80-26 38 36 42 30"
        stroke="var(--color-brand-400)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Hoja pequeña — usada en badges. */
export function LeafIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 9-4 16-9 16Z" />
      <path d="M4 13c5-1 9-3 12-7" />
    </svg>
  );
}
