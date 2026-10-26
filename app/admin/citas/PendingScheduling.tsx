"use client";

import { useCallback, useEffect, useState } from "react";
import {
  confirmAppointmentById,
  getAppointmentAvailability,
  getAppointmentSlots,
  listPendingAppointments,
  type PendingAppointment,
} from "../../lib/admin";
import { MonthCalendar } from "../../components/MonthCalendar";
import { ClockIcon } from "../icons";

const BUSINESS_TZ = "America/Guatemala";

/**
 * Bandeja de citas por agendar: pago aprobado pero sin horario confirmado.
 *
 * Es la unica herramienta de la secretaria (y tambien la usa la
 * nutricionista). Para cada cita se elige dia + hora (o se acepta la que
 * propuso la paciente), se pega el link de la videollamada y al confirmar
 * la paciente recibe el correo con fecha y enlace.
 */
export function PendingScheduling({ onScheduled }: { onScheduled: () => void }) {
  const [items, setItems] = useState<PendingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Al recargar (reloadKey) la lista anterior se queda visible hasta que
  // llega la nueva; solo el primer render muestra "Loading".
  useEffect(() => {
    let cancelled = false;
    listPendingAppointments()
      .then(({ appointments }) => {
        if (!cancelled) {
          setItems(appointments);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Could not load pending appointments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function handleScheduled() {
    setOpenId(null);
    setReloadKey((k) => k + 1);
    onScheduled();
  }

  if (loading && items.length === 0) {
    return (
      <div className="mb-5 rounded-3xl bg-white border border-cream-200 p-5">
        <p className="text-xs text-ink-400">Loading pending appointments…</p>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-3xl bg-white border border-cream-200 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xs uppercase tracking-wider font-semibold text-ink-500">
            To schedule
          </h2>
          <p className="text-sm text-ink-500 mt-1">
            Paid consultations waiting for a confirmed time and video call link.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1">
          {items.length} pending
        </span>
      </div>

      {error && (
        <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-ink-400 py-6 text-center">
          Nothing to schedule right now.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-cream-100">
          {items.map((a) => (
            <li key={a.id} className="py-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900">{a.patient.fullName}</p>
                  <p className="text-xs text-ink-500">
                    {a.service.name} · {a.durationMin} min
                    {a.patient.phone ? ` · ${a.patient.phone}` : ""}
                  </p>
                  <p className="text-xs text-ink-500">{a.patient.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {a.scheduledAt ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-medium px-2.5 py-1">
                      <ClockIcon className="h-3.5 w-3.5" />
                      Proposed: {fmtDateTime(a.scheduledAt, BUSINESS_TZ)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-cream-100 text-ink-600 text-[11px] font-medium px-2.5 py-1">
                      No time chosen yet
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === a.id ? null : a.id)}
                    className="rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-4 py-2"
                  >
                    {openId === a.id ? "Close" : "Schedule"}
                  </button>
                </div>
              </div>

              {openId === a.id && (
                <ScheduleForm appointment={a} onDone={handleScheduled} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ScheduleForm({
  appointment,
  onDone,
}: {
  appointment: PendingAppointment;
  onDone: () => void;
}) {
  const proposed = appointment.scheduledAt;
  // Si la paciente ya propuso hora, por defecto se acepta esa. Siempre se
  // puede cambiar eligiendo otro dia/hora.
  const [useProposed, setUseProposed] = useState<boolean>(!!proposed);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState(appointment.meetingUrl ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(
    (month: string) => getAppointmentAvailability(appointment.id, month),
    [appointment.id],
  );

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setPickedSlot(null);
    setSlots(null);
    setSlotsLoading(true);
  }

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    getAppointmentSlots(appointment.id, selectedDate)
      .then((data) => {
        if (!cancelled) setSlots(data.slots);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appointment.id, selectedDate]);

  const effectiveTime = useProposed ? proposed : pickedSlot;
  const canSubmit = !!effectiveTime && meetingUrl.trim().length > 0 && !submitting;

  async function submit() {
    if (!effectiveTime) {
      setError("Pick a date and time first.");
      return;
    }
    const url = meetingUrl.trim();
    if (!url) {
      setError("The video call link is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await confirmAppointmentById(appointment.id, {
        meetingUrl: url,
        // Solo mandamos scheduledAt si se eligio una hora distinta a la propuesta.
        scheduledAt: useProposed ? undefined : effectiveTime,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  const patientTz = appointment.patient.timezone;

  return (
    <div className="mt-3 rounded-2xl border border-brand-200 bg-brand-50/40 p-4">
      {/* Paso 1: horario */}
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
        1 · Date and time (Guatemala)
      </p>

      {proposed && (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setUseProposed(true)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              useProposed
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-cream-200 bg-white text-ink-700 hover:border-brand-300"
            }`}
          >
            Accept proposed: {fmtDateTime(proposed, BUSINESS_TZ)}
          </button>
          <button
            type="button"
            onClick={() => setUseProposed(false)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              !useProposed
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-cream-200 bg-white text-ink-700 hover:border-brand-300"
            }`}
          >
            Choose another time
          </button>
        </div>
      )}

      {!useProposed && (
        <div className="mt-3 space-y-3">
          <div className="rounded-2xl bg-white border border-cream-200 p-3 max-w-sm">
            <MonthCalendar
              fetchAvailability={fetchAvailability}
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
            />
          </div>
          <div className="rounded-2xl bg-white border border-cream-200 p-3">
            {!selectedDate ? (
              <p className="text-sm text-ink-400 py-6 text-center">
                Select a day to see free times.
              </p>
            ) : slotsLoading ? (
              <p className="text-sm text-ink-400 py-6 text-center">Looking for free times…</p>
            ) : !slots || slots.length === 0 ? (
              <p className="text-sm text-ink-400 py-6 text-center">
                No free times that day. Pick another date.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((iso) => {
                  const isPicked = iso === pickedSlot;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setPickedSlot(iso)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
                        isPicked
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-cream-200 bg-white text-ink-900 hover:border-brand-400"
                      }`}
                    >
                      <span className="font-medium">{fmtTime(iso, BUSINESS_TZ)}</span>
                      {patientTz !== BUSINESS_TZ && (
                        <span className={`ml-1.5 text-[11px] ${isPicked ? "text-white/80" : "text-ink-500"}`}>
                          ({fmtTime(iso, patientTz)} patient)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paso 2: link */}
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-brand-700">
        2 · Video call link (Meet / Zoom)
      </p>
      <input
        type="url"
        value={meetingUrl}
        onChange={(e) => {
          setMeetingUrl(e.target.value);
          setError(null);
        }}
        placeholder="https://meet.google.com/..."
        className="mt-2 w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5"
        >
          {submitting ? "Confirming…" : "Confirm appointment and email the patient"}
        </button>
        <span className="text-xs text-ink-500">
          {effectiveTime
            ? `Will confirm for ${fmtDateTime(effectiveTime, BUSINESS_TZ)}${
                patientTz !== BUSINESS_TZ
                  ? ` (${fmtDateTime(effectiveTime, patientTz)} for the patient)`
                  : ""
              }.`
            : "No time selected yet."}
        </span>
      </div>
    </div>
  );
}

function fmtDateTime(iso: string, tz: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fmtTime(iso: string, tz: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  });
}
