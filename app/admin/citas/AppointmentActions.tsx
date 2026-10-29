"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cancelAppointment,
  getAppointmentAvailability,
  getAppointmentSlots,
  rescheduleAppointment,
  type AppointmentItem,
} from "../../lib/admin";
import { MonthCalendar } from "../../components/MonthCalendar";
import { useAdminT } from "../../lib/admin-i18n";

const BUSINESS_TZ = "America/Guatemala";

/**
 * Acciones sobre una cita del calendario: reprogramar (confirmada o
 * cancelada) y cancelar (confirmada o propuesta). Cada una abre un panel en
 * linea; ambas avisan a la paciente por correo.
 */
export function AppointmentActions({
  appointment,
  onDone,
}: {
  appointment: AppointmentItem;
  onDone: () => void;
}) {
  const t = useAdminT();
  const [mode, setMode] = useState<"none" | "reschedule" | "cancel">("none");

  const canReschedule =
    appointment.status === "SCHEDULED" || appointment.status === "CANCELED";
  const canCancel =
    appointment.status === "SCHEDULED" || appointment.status === "PENDING_CONFIRMATION";

  if (!canReschedule && !canCancel) return null;

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {canReschedule && (
          <button
            type="button"
            onClick={() => setMode(mode === "reschedule" ? "none" : "reschedule")}
            className="text-xs font-medium text-brand-700 hover:text-brand-800"
          >
            {mode === "reschedule"
              ? t.common.close
              : appointment.status === "CANCELED"
                ? t.actions.reactivate
                : t.actions.reschedule}
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            onClick={() => setMode(mode === "cancel" ? "none" : "cancel")}
            className="text-xs font-medium text-red-700 hover:text-red-800"
          >
            {mode === "cancel" ? t.common.close : t.actions.cancel}
          </button>
        )}
      </div>

      {mode === "reschedule" && (
        <ReschedulePanel
          appointment={appointment}
          onDone={() => {
            setMode("none");
            onDone();
          }}
        />
      )}
      {mode === "cancel" && (
        <CancelPanel
          appointment={appointment}
          onDone={() => {
            setMode("none");
            onDone();
          }}
        />
      )}
    </div>
  );
}

function CancelPanel({
  appointment,
  onDone,
}: {
  appointment: AppointmentItem;
  onDone: () => void;
}) {
  const t = useAdminT();
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await cancelAppointment(appointment.id, reason.trim() || undefined);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3">
      <p className="text-[11px] text-red-900 leading-snug">
        {appointment.patient.fullName} {t.actions.cancelInfo}
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        placeholder={t.actions.cancelReasonPh}
        className="mt-2 w-full rounded-lg border border-red-300 bg-white px-2 py-1.5 text-xs focus:border-red-500 focus:outline-none"
      />
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="rounded-full bg-red-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? t.citas.sending : t.actions.cancelConfirm}
        </button>
      </div>
    </div>
  );
}

function ReschedulePanel({
  appointment,
  onDone,
}: {
  appointment: AppointmentItem;
  onDone: () => void;
}) {
  const t = useAdminT();
  const dl = t.dateLocale;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState(appointment.meetingUrl ?? "");
  const [saving, setSaving] = useState(false);
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
      .then((d) => {
        if (!cancelled) setSlots(d.slots);
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

  async function submit() {
    if (!pickedSlot) return;
    setSaving(true);
    setError(null);
    try {
      const url = meetingUrl.trim();
      await rescheduleAppointment(appointment.id, {
        scheduledAt: pickedSlot,
        // Solo mandamos el link si cambio; si va vacio se conserva el anterior.
        meetingUrl: url && url !== (appointment.meetingUrl ?? "") ? url : undefined,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl bg-brand-50/60 border border-brand-200 p-3 space-y-3">
      <p className="text-[11px] text-brand-900 leading-snug">
        {appointment.patient.fullName} {t.actions.rescheduleInfo}
      </p>
      <div className="rounded-xl bg-white border border-cream-200 p-2">
        <MonthCalendar
          fetchAvailability={fetchAvailability}
          selectedDate={selectedDate}
          onSelect={handleDateSelect}
        />
      </div>
      <div className="rounded-xl bg-white border border-cream-200 p-2">
        {!selectedDate ? (
          <p className="text-xs text-ink-400 py-3 text-center">{t.pending.selectDay}</p>
        ) : slotsLoading ? (
          <p className="text-xs text-ink-400 py-3 text-center">{t.pending.lookingSlots}</p>
        ) : !slots || slots.length === 0 ? (
          <p className="text-xs text-ink-400 py-3 text-center">{t.pending.noSlots}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {slots.map((iso) => {
              const isPicked = iso === pickedSlot;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setPickedSlot(iso)}
                  className={`rounded-full border px-3 py-1 text-xs whitespace-nowrap transition-colors ${
                    isPicked
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-cream-200 bg-white text-ink-900 hover:border-brand-400"
                  }`}
                >
                  {fmtTime(iso, BUSINESS_TZ, dl)}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {appointment.modality === "IN_PERSON" ? (
        <p className="text-[11px] text-ink-600">{t.modality.inPerson} · {t.modality.inPersonHint}</p>
      ) : (
        <label className="block">
          <span className="block text-[11px] text-ink-600 mb-1">{t.actions.meetingLink}</span>
          <input
            type="url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="w-full rounded-lg border border-cream-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
      )}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={submit}
          disabled={!pickedSlot || saving}
          className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-medium px-3 py-1.5 self-start"
        >
          {saving ? t.citas.sending : t.actions.rescheduleConfirm}
        </button>
        <span className="text-[11px] text-ink-500">
          {pickedSlot
            ? `${t.actions.newTime} ${fmtDateTime(pickedSlot, BUSINESS_TZ, dl)}`
            : t.pending.noTimeSelected}
        </span>
      </div>
    </div>
  );
}

function fmtDateTime(iso: string, tz: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fmtTime(iso: string, tz: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  });
}
