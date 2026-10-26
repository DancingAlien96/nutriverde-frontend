"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createManualAppointment,
  lookupPatientByEmail,
} from "../../lib/admin";
import {
  fetchServiceAvailability,
  fetchServiceSlots,
  fetchServices,
  type ApiService,
} from "../../lib/api";
import { MonthCalendar } from "../../components/MonthCalendar";
import { CloseIcon } from "../icons";

const BUSINESS_TZ = "America/Guatemala";

// Zonas habituales de las pacientes. Se puede escribir otra en el campo.
const TIMEZONES = [
  "America/Guatemala",
  "America/Mexico_City",
  "America/El_Salvador",
  "America/Tegucigalpa",
  "America/Costa_Rica",
  "America/Panama",
  "America/Bogota",
  "America/Lima",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/Madrid",
];

/**
 * Cita desde cero: paciente (nueva o existente por correo), servicio, dia y
 * hora libres, link de videollamada. Al crear, la cita ya queda confirmada y
 * la paciente recibe el correo. No pasa por pago.
 */
export function NewAppointment({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (scheduledAt: string) => void;
}) {
  const [services, setServices] = useState<ApiService[]>([]);
  const [serviceSlug, setServiceSlug] = useState<string>("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState(BUSINESS_TZ);
  const [existing, setExisting] = useState<{ fullName: string } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);

  const [meetingUrl, setMeetingUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices()
      .then((list) => {
        setServices(list);
        if (list.length > 0) setServiceSlug(list[0].slug);
      })
      .catch(() => setError("Could not load services."));
  }, []);

  const service = services.find((s) => s.slug === serviceSlug) ?? null;

  const fetchAvailability = useCallback(
    (month: string) =>
      serviceSlug
        ? fetchServiceAvailability(serviceSlug, month)
        : Promise.reject(new Error("no service")),
    [serviceSlug],
  );

  // Al cambiar de servicio cambia la duracion, asi que los slots ya no valen.
  function handleServiceChange(slug: string) {
    setServiceSlug(slug);
    setSelectedDate(null);
    setSlots(null);
    setPickedSlot(null);
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setPickedSlot(null);
    setSlots(null);
    setSlotsLoading(true);
  }

  useEffect(() => {
    if (!serviceSlug || !selectedDate) return;
    let cancelled = false;
    fetchServiceSlots(serviceSlug, selectedDate)
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
  }, [serviceSlug, selectedDate]);

  async function handleEmailBlur() {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes("@")) return;
    setLookingUp(true);
    try {
      const { patient } = await lookupPatientByEmail(e);
      if (patient) {
        setExisting({ fullName: patient.fullName });
        setFullName(patient.fullName);
        if (patient.phone) setPhone(patient.phone);
        if (patient.timezone) setTimezone(patient.timezone);
      } else {
        setExisting(null);
      }
    } catch {
      // La busqueda es solo una ayuda; si falla seguimos como paciente nueva.
      setExisting(null);
    } finally {
      setLookingUp(false);
    }
  }

  const canSubmit =
    !!service &&
    email.trim().length > 3 &&
    fullName.trim().length >= 2 &&
    !!pickedSlot &&
    meetingUrl.trim().length > 0 &&
    !submitting;

  async function submit() {
    if (!service || !pickedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      await createManualAppointment({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        timezone: timezone.trim() || BUSINESS_TZ,
        serviceId: service.id,
        scheduledAt: pickedSlot,
        meetingUrl: meetingUrl.trim(),
        notes: notes.trim() || undefined,
      });
      onCreated(pickedSlot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-5 rounded-3xl bg-white border border-brand-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs uppercase tracking-wider font-semibold text-brand-700">
            New appointment
          </h2>
          <p className="text-sm text-ink-500 mt-1">
            Register the patient, pick a free time and send the confirmation
            email. No payment is recorded for appointments created here.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="h-8 w-8 shrink-0 rounded-full text-ink-500 hover:bg-cream-100 flex items-center justify-center"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-5">
        {/* Columna izquierda: paciente + servicio */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            1 · Patient
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Email *" hint={lookingUp ? "Checking…" : existing ? "Existing patient" : undefined}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="patient@email.com"
                className={inputCls}
              />
            </Field>
            <Field label="Full name *">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                readOnly={!!existing}
                className={`${inputCls} ${existing ? "bg-cream-50 text-ink-600" : ""}`}
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+502 ..."
                className={inputCls}
              />
            </Field>
            <Field label="Time zone">
              <input
                type="text"
                list="nv-timezones"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={inputCls}
              />
              <datalist id="nv-timezones">
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} />
                ))}
              </datalist>
            </Field>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 pt-2">
            2 · Service
          </p>
          <select
            value={serviceSlug}
            onChange={(e) => handleServiceChange(e.target.value)}
            className={inputCls}
          >
            {services.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name} · {s.durationMin > 0 ? `${s.durationMin} min` : "60 min"}
              </option>
            ))}
          </select>

          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 pt-2">
            4 · Video call link (Meet / Zoom) *
          </p>
          <input
            type="url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
            className={inputCls}
          />

          <Field label="Internal notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Paid in cash at the clinic"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Columna derecha: dia + hora */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-3">
            3 · Date and time (Guatemala)
          </p>
          <div className="space-y-3">
            <div className="rounded-2xl border border-cream-200 p-3 max-w-sm">
              {serviceSlug ? (
                <MonthCalendar
                  key={serviceSlug}
                  fetchAvailability={fetchAvailability}
                  selectedDate={selectedDate}
                  onSelect={handleDateSelect}
                />
              ) : (
                <p className="text-sm text-ink-400 py-6 text-center">Loading services…</p>
              )}
            </div>
            <div className="rounded-2xl border border-cream-200 p-3">
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
                        {timezone && timezone !== BUSINESS_TZ && (
                          <span className={`ml-1.5 text-[11px] ${isPicked ? "text-white/80" : "text-ink-500"}`}>
                            ({safeFmtTime(iso, timezone)} patient)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5"
        >
          {submitting ? "Creating…" : "Create appointment and email the patient"}
        </button>
        <span className="text-xs text-ink-500">
          {pickedSlot
            ? `${service?.name ?? ""} · ${fmtDateTime(pickedSlot, BUSINESS_TZ)}${
                timezone && timezone !== BUSINESS_TZ
                  ? ` (${safeFmtDateTime(pickedSlot, timezone)} for the patient)`
                  : ""
              }`
            : "Pick a service, a day and a time."}
        </span>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs text-ink-600 mb-1">
        <span>{label}</span>
        {hint && <span className="text-brand-700 font-medium">{hint}</span>}
      </span>
      {children}
    </label>
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

// La zona la escribe la secretaria; si no es valida no rompemos la pantalla.
function safeFmtTime(iso: string, tz: string): string {
  try {
    return fmtTime(iso, tz);
  } catch {
    return "?";
  }
}
function safeFmtDateTime(iso: string, tz: string): string {
  try {
    return fmtDateTime(iso, tz);
  } catch {
    return "?";
  }
}
