"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney, listOutstandingCharges, type OutstandingCharge } from "../../lib/admin";
import { useAdminT } from "../../lib/admin-i18n";
import { ChargePanel } from "../ChargePanel";

const COLLAPSED = 4;

/**
 * "Por cobrar": citas y paquetes agendados desde el panel a los que les
 * falta dinero. Desde aquí se registra el siguiente abono sin tener que
 * buscar la cita en el calendario.
 */
export function OutstandingCard({
  reloadKey,
  canManage,
  onChanged,
  showEmpty = false,
}: {
  reloadKey: number;
  canManage: boolean;
  onChanged: () => void;
  /** Sin saldos pendientes, mostrar el aviso en vez de no pintar nada. */
  showEmpty?: boolean;
}) {
  const t = useAdminT();
  const [items, setItems] = useState<OutstandingCharge[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listOutstandingCharges()
      .then(({ charges, totalCents }) => {
        if (cancelled) return;
        setItems(charges);
        setTotal(totalCents);
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

  if (!loaded) return null;
  if (items.length === 0) {
    if (!showEmpty) return null;
    return (
      <div className="mb-5 rounded-3xl bg-white border border-cream-200 p-5">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-ink-500">
          {t.charge.outstandingTitle}
        </h2>
        <p className="text-sm text-ink-400 py-6 text-center">{t.charge.outstandingEmpty}</p>
      </div>
    );
  }

  const visible = showAll ? items : items.slice(0, COLLAPSED);

  return (
    <div className="mb-5 rounded-3xl bg-white border border-cream-200 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xs uppercase tracking-wider font-semibold text-ink-500">
            {t.charge.outstandingTitle}
          </h2>
          <p className="text-sm text-ink-500 mt-1">{t.charge.outstandingSubtitle}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] uppercase tracking-wider text-ink-500">{t.charge.total}</p>
          <p className="text-lg font-semibold text-amber-800 tabular-nums">
            {formatMoney(total, "GTQ")}
          </p>
        </div>
      </div>

      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {visible.map((c) => (
          <li key={c.id} className="rounded-2xl border border-cream-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/admin/patients/${c.patient.id}`}
                  className="text-sm font-medium text-ink-900 hover:text-brand-700"
                >
                  {c.patient.fullName}
                </Link>
                <p className="text-xs text-ink-500">
                  {c.serviceName} ·{" "}
                  {c.scope === "PACKAGE" ? t.charge.packageWord : t.charge.singleWord}
                  {c.patient.phone ? ` · ${c.patient.phone}` : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 tabular-nums">
                {t.charge.owes} {formatMoney(c.balanceCents, c.currency)}
              </span>
            </div>
            <ChargePanel
              charge={c}
              target={c.packageId ? { packageId: c.packageId } : { appointmentId: c.appointmentId ?? undefined }}
              canManage={canManage}
              onChanged={onChanged}
            />
          </li>
        ))}
      </ul>

      {items.length > COLLAPSED && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          {showAll ? t.charge.showLess : `${t.charge.showAll} (${items.length})`}
        </button>
      )}
    </div>
  );
}
