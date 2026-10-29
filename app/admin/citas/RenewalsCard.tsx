"use client";

import { useEffect, useState } from "react";
import { listRenewals, type RenewalItem } from "../../lib/admin";
import { useAdminT } from "../../lib/admin-i18n";

/**
 * Pacientes cuyo paquete se agotó y no tienen otro con sesiones. Es la
 * alerta proactiva: no hay que abrir a la paciente para enterarse. Desde
 * aquí se le agenda la siguiente cita (sin paquete o con el nuevo que pague).
 */
export function RenewalsCard({
  reloadKey,
  onBook,
}: {
  reloadKey: number;
  onBook: (email: string) => void;
}) {
  const t = useAdminT();
  const [items, setItems] = useState<RenewalItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listRenewals()
      .then(({ renewals }) => {
        if (!cancelled) setItems(renewals);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Sin pendientes no ocupamos espacio: la tarjeta solo aparece cuando hay
  // alguien por renovar.
  if (!loaded || items.length === 0) return null;

  return (
    <div className="mb-5 rounded-3xl bg-amber-50 border border-amber-200 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xs uppercase tracking-wider font-semibold text-amber-800">
            {t.renewals.title}
          </h2>
          <p className="text-sm text-amber-900/80 mt-1">{t.renewals.subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-200 text-amber-900 text-xs font-medium px-3 py-1">
          {items.length}
        </span>
      </div>

      <ul className="mt-4 divide-y divide-amber-200/70">
        {items.map((r) => (
          <li
            key={r.packageId}
            className="py-3 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink-900">{r.patient.fullName}</p>
              <p className="text-xs text-ink-600">
                {r.serviceName} · {r.totalSessions}/{r.totalSessions}
                {r.patient.phone ? ` · ${r.patient.phone}` : ""}
              </p>
              <p className="text-xs text-ink-600">
                {r.lastSessionAt
                  ? `${r.lastSessionDone ? t.renewals.lastDone : t.renewals.lastUpcoming} ${fmtDate(
                      r.lastSessionAt,
                      t.dateLocale,
                    )}`
                  : t.renewals.noDate}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onBook(r.patient.email)}
              className="rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-4 py-2 self-start sm:self-auto"
            >
              {t.renewals.book}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function fmtDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    timeZone: "America/Guatemala",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
