"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "../AdminShell";
import {
  listAppointments,
  declineAppointmentTime,
  formatCents,
  type AppointmentItem,
  type AppointmentStatus,
} from "../../lib/admin";
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "../icons";
import { PendingScheduling } from "./PendingScheduling";
import { NewAppointment } from "./NewAppointment";
import { AppointmentActions } from "./AppointmentActions";
import { useAdminT } from "../../lib/admin-i18n";

export default function CitasPage() {
  return (
    <AdminShell>
      <CitasContent />
    </AdminShell>
  );
}

// Estilos por estado; las etiquetas viven en el diccionario (t.citas.status).
const STATUS: Record<AppointmentStatus, { chip: string; dot: string }> = {
  SCHEDULED: { chip: "bg-brand-100 text-brand-800", dot: "#8a9b67" },
  PENDING_CONFIRMATION: { chip: "bg-amber-100 text-amber-800", dot: "#d9a441" },
  COMPLETED: { chip: "bg-cream-200 text-ink-600", dot: "#a9a190" },
  CANCELED: { chip: "bg-red-50 text-red-700 line-through", dot: "#c27a63" },
  NO_SHOW: { chip: "bg-red-50 text-red-700", dot: "#c27a63" },
  PAYMENT_APPROVED: { chip: "bg-brand-50 text-brand-700", dot: "#b7c393" },
  AWAITING_PAYMENT: { chip: "bg-cream-100 text-ink-500", dot: "#cbb58f" },
};

function CitasContent() {
  const t = useAdminT();
  // Primer día del mes enfocado.
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selected, setSelected] = useState<Date>(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  });
  const [appts, setAppts] = useState<AppointmentItem[]>([]);
  // Se incrementa al rechazar un horario para forzar la recarga del calendario.
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Formulario de cita desde cero (paciente nueva o existente).
  const [creating, setCreating] = useState(false);

  // Rango visible del grid (6 semanas desde el lunes anterior al día 1).
  const { gridStart, days } = useMemo(() => {
    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (monthStart.getDay() + 6) % 7; // 0 = lunes
    const start = addDays(monthStart, -offset);
    const ds = Array.from({ length: 42 }, (_, i) => addDays(start, i));
    return { gridStart: start, days: ds };
  }, [cursor]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const from = gridStart.toISOString();
    const to = addDays(gridStart, 42).toISOString();
    listAppointments({ from, to })
      .then(({ appointments }) => {
        if (!cancelled) setAppts(appointments);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : t.citas.loadError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gridStart, reloadKey, t.citas.loadError]);

  // Agrupa por día local (YYYY-MM-DD).
  const byDay = useMemo(() => {
    const map = new Map<string, AppointmentItem[]>();
    for (const a of appts) {
      const key = dateKey(new Date(a.scheduledAt));
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    return map;
  }, [appts]);

  const today = new Date();
  const selectedAppts = byDay.get(dateKey(selected)) ?? [];

  function goMonth(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }
  function goToday() {
    const n = new Date();
    setCursor(new Date(n.getFullYear(), n.getMonth(), 1));
    setSelected(new Date(n.getFullYear(), n.getMonth(), n.getDate()));
  }

  return (
    <>
      {/* Encabezado */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-ink-900">{t.citas.title}</h1>
          <p className="text-sm text-ink-500 mt-1">{t.citas.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className={`rounded-full px-4 h-9 text-sm font-medium transition-colors ${
              creating
                ? "border border-cream-200 bg-white text-ink-700 hover:bg-cream-50"
                : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            {creating ? t.common.cancel : t.citas.newAppointment}
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-full border border-cream-200 bg-white px-4 h-9 text-sm font-medium text-ink-700 hover:bg-cream-50"
          >
            {t.common.today}
          </button>
          <div className="flex items-center rounded-full border border-cream-200 bg-white">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              aria-label={t.common.prevMonth}
              className="h-9 w-9 flex items-center justify-center text-ink-600 hover:text-ink-900"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="px-2 text-sm font-medium text-ink-900 capitalize min-w-[8.5rem] text-center">
              {cursor.toLocaleDateString(t.dateLocale, {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              onClick={() => goMonth(1)}
              aria-label={t.common.nextMonth}
              className="h-9 w-9 flex items-center justify-center text-ink-600 hover:text-ink-900"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {creating && (
        <NewAppointment
          onClose={() => setCreating(false)}
          onCreated={(iso) => {
            setCreating(false);
            // Saltamos al dia de la cita recien creada y recargamos.
            const d = new Date(iso);
            setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
            setSelected(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
            setReloadKey((k) => k + 1);
          }}
        />
      )}

      {/* Citas con pago aprobado que faltan agendar. Al confirmar una se
          recarga el calendario para que aparezca de inmediato. */}
      <PendingScheduling onScheduled={() => setReloadKey((k) => k + 1)} />

      <div className="grid lg:grid-cols-[1fr_20rem] gap-5">
        {/* Calendario */}
        <div className="rounded-3xl bg-white border border-cream-200 p-3 sm:p-4">
          {/* Cabecera de días */}
          <div className="grid grid-cols-7 mb-1">
            {t.citas.weekdays.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] uppercase tracking-wider text-ink-400 font-medium py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Celdas */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const inMonth = day.getMonth() === cursor.getMonth();
              const isToday = sameDay(day, today);
              const isSelected = sameDay(day, selected);
              const dayAppts = byDay.get(dateKey(day)) ?? [];
              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  onClick={() => setSelected(new Date(day))}
                  className={`min-h-[68px] sm:min-h-[88px] rounded-xl border p-1.5 text-left flex flex-col gap-1 transition-colors ${
                    isSelected
                      ? "border-brand-400 bg-brand-50/50"
                      : "border-transparent hover:bg-cream-50"
                  } ${inMonth ? "" : "opacity-40"}`}
                >
                  <span
                    className={`text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-brand-500 text-white"
                        : "text-ink-700"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayAppts.slice(0, 3).map((a) => (
                      <span
                        key={a.id}
                        className={`truncate rounded px-1 py-0.5 text-[10px] leading-tight font-medium ${STATUS[a.status].chip}`}
                      >
                        {formatTime(a.scheduledAt, t.dateLocale)} {a.patient.fullName.split(/\s+/)[0]}
                      </span>
                    ))}
                    {dayAppts.length > 3 && (
                      <span className="text-[10px] text-ink-500 px-1">
                        +{dayAppts.length - 3} {t.citas.more}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {loading && (
            <p className="text-xs text-ink-400 text-center mt-3">{t.citas.loading}</p>
          )}
        </div>

        {/* Panel del día seleccionado */}
        <div className="rounded-3xl bg-white border border-cream-200 p-5 flex flex-col">
          <p className="text-xs uppercase tracking-wider font-semibold text-ink-500">
            {sameDay(selected, today) ? t.common.today : t.citas.selectedDay}
          </p>
          <p className="font-serif-display text-lg text-ink-900 mt-1 capitalize">
            {selected.toLocaleDateString(t.dateLocale, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>

          <div className="mt-4 flex-1">
            {selectedAppts.length === 0 ? (
              <p className="text-sm text-ink-400 py-6 text-center">
                {t.citas.none}
              </p>
            ) : (
              <ul className="space-y-3">
                {[...selectedAppts]
                  .sort(
                    (a, b) =>
                      new Date(a.scheduledAt).getTime() -
                      new Date(b.scheduledAt).getTime(),
                  )
                  .map((a) => (
                    <li
                      key={a.id}
                      className="rounded-2xl border border-cream-200 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-900">
                          <ClockIcon className="h-4 w-4 text-ink-400" />
                          {formatTime(a.scheduledAt, t.dateLocale)}
                          <span className="text-ink-400 font-normal">
                            · {a.durationMin} min
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS[a.status].chip}`}
                        >
                          {t.citas.status[a.status]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-ink-900">
                        {a.patient.fullName}
                      </p>
                      <p className="text-xs text-ink-500">{a.service.name}</p>
                      {a.package && a.package.sessionNumber && (
                        <p
                          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            a.package.sessionNumber >= a.package.totalSessions
                              ? "bg-amber-100 text-amber-800"
                              : "bg-cream-100 text-ink-600"
                          }`}
                        >
                          {t.packages.session} {a.package.sessionNumber} {t.packages.of}{" "}
                          {a.package.totalSessions}
                          {a.package.sessionNumber >= a.package.totalSessions
                            ? ` · ${t.packages.lastSession}`
                            : ""}
                        </p>
                      )}
                      {a.payment && (
                        <p className="text-xs text-ink-500 mt-0.5">
                          {formatCents(a.payment.amountCents, a.payment.currency)}
                        </p>
                      )}
                      {a.meetingUrl && (
                        <a
                          href={a.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
                        >
                          {t.citas.join}
                        </a>
                      )}

                      {(a.status === "SCHEDULED" ||
                        a.status === "PENDING_CONFIRMATION") && (
                        <DeclineTime
                          appointment={a}
                          onDone={() => setReloadKey((k) => k + 1)}
                        />
                      )}
                      <AppointmentActions
                        appointment={a}
                        onDone={() => setReloadKey((k) => k + 1)}
                      />
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Leyenda */}
          <div className="mt-4 pt-4 border-t border-cream-100 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {(
              ["SCHEDULED", "PENDING_CONFIRMATION", "COMPLETED", "CANCELED"] as AppointmentStatus[]
            ).map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 text-[11px] text-ink-500"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STATUS[s].dot }}
                />
                {t.citas.status[s]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * "No puedo este horario": devuelve la cita a pendiente de horario y le
 * reenvia a la paciente el link para que elija otro. Pide confirmacion porque
 * dispara un correo y libera el slot.
 */
function DeclineTime({
  appointment,
  onDone,
}: {
  appointment: AppointmentItem;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useAdminT();

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await declineAppointmentTime(appointment.id, reason.trim() || undefined);
      setOpen(false);
      setReason("");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 block text-xs font-medium text-amber-700 hover:text-amber-800"
      >
        {t.citas.cantMake}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
      <p className="text-[11px] text-amber-900 leading-snug">
        {appointment.patient.fullName} {t.citas.declineInfo}
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        placeholder={t.citas.declinePh}
        className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-2 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
      />
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="rounded-full bg-amber-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-amber-700 disabled:opacity-50"
        >
          {saving ? t.citas.sending : t.citas.declineSubmit}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="text-xs text-ink-500 hover:text-ink-700"
        >
          {t.common.cancel}
        </button>
      </div>
    </div>
  );
}

/* Helpers de fecha */
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
}
