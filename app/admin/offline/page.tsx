/**
 * Página que muestra el service worker cuando no hay conexión y la ruta
 * pedida no está en caché. Estática a propósito: no depende de la API.
 */
export default function AdminOfflinePage() {
  return (
    <main className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <p className="font-serif-display text-2xl tracking-[0.06em] text-ink-900">PLENHA</p>
        <h1 className="mt-6 text-lg font-semibold text-ink-900">Sin conexión</h1>
        <p className="mt-2 text-sm text-ink-600">
          No se pudo cargar el panel. Revisa tu conexión a internet y vuelve a
          intentarlo.
        </p>
        <p className="mt-1 text-sm text-ink-600">
          No connection. Check your internet and try again.
        </p>
        <a
          href="/admin/citas"
          className="mt-6 inline-block rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5"
        >
          Reintentar · Retry
        </a>
      </div>
    </main>
  );
}
