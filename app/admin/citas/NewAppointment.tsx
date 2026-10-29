"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createManualAppointment,
  lookupPatientByEmail,
  type EmailOutcome,
  type Modality,
  type PatientPackage,
} from "../../lib/admin";
import {
  fetchServiceAvailability,
  fetchServiceSlots,
  fetchServices,
  type ApiService,
} from "../../lib/api";
import { MonthCalendar } from "../../components/MonthCalendar";
import { CloseIcon } from "../icons";
import { useAdminT } from "../../lib/admin-i18n";

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
  initialEmail,
}: {
  onClose: () => void;
  onCreated: (scheduledAt: string, email: EmailOutcome) => void;
  /** Correo con el que abrir el formulario ya buscado (desde "Por renovar"). */
  initialEmail?: string;
}) {
  const t = useAdminT();
  const dl = t.dateLocale;
  const [services, setServices] = useState<ApiService[]>([]);
  const [serviceSlug, setServiceSlug] = useState<string>("");

  const [email, setEmail] = useState(initialEmail ?? "");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState(BUSINESS_TZ);
  const [existing, setExisting] = useState<{ fullName: string } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  // Paquetes de la paciente encontrada y cual descuenta esta cita ("" = ninguno).
  const [packages, setPackages] = useState<PatientPackage[]>([]);
  const [packageId, setPackageId] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);

  const [meetingUrl, setMeetingUrl] = useState("");
  const [modality, setModality] = useState<Modality>("VIRTUAL");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


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

  function handleEmailBlur() {
    return lookup(email, services);
  }

  async function lookup(raw: string, svcList: ApiService[]) {
    const e = raw.trim().toLowerCase();
    if (!e || !e.includes("@")) return;
    setLookingUp(true);
    try {
      const { patient, packages: pkgs } = await lookupPatientByEmail(e);
      if (patient) {
        setExisting({ fullName: patient.fullName });
        setFullName(patient.fullName);
        if (patient.phone) setPhone(patient.phone);
        if (patient.timezone) setTimezone(patient.timezone);
        setPackages(pkgs);
        // Por defecto descuenta del primer paquete con sesiones; si el
        // servicio del paquete existe en la lista, lo seleccionamos.
        const withLeft = pkgs.find((p) => p.remaining > 0);
        setPackageId(withLeft?.id ?? "");
        if (withLeft) {
          const svc = svcList.find((s) => s.id === withLeft.serviceId);
          if (svc) handleServiceChange(svc.slug);
        }
      } else {
        setExisting(null);
        setPackages([]);
        setPackageId("");
      }
    } catch {
      // La busqueda es solo una ayuda; si falla seguimos como paciente nueva.
      setExisting(null);
      setPackages([]);
      setPackageId("");
    } finally {
      setLookingUp(false);
    }
  }

  // Carga de servicios. Va después de `lookup` porque la usa al abrir el
  // formulario desde "Por renovar".
  useEffect(() => {
    let cancelled = false;
    fetchServices()
      .then((list) => {
        if (cancelled) return;
        setServices(list);
        if (list.length > 0) setServiceSlug(list[0].slug);
        // Si venimos de "Por renovar", buscamos a la paciente de una vez.
        if (initialEmail) void lookup(initialEmail, list);
      })
      .catch(() => {
        if (!cancelled) setError(t.newAppt.servicesError);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.newAppt.servicesError, initialEmail]);

  const canSubmit =
    !!service &&
    email.trim().length > 3 &&
    fullName.trim().length >= 2 &&
    !!pickedSlot &&
    !submitting;

  async function submit() {
    if (!service || !pickedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createManualAppointment({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        timezone: timezone.trim() || BUSINESS_TZ,
        serviceId: service.id,
        packageId: packageId || undefined,
        scheduledAt: pickedSlot,
        modality,
        meetingUrl: modality === "VIRTUAL" ? meetingUrl.trim() || undefined : undefined,
        notes: notes.trim() || undefined,
      });
      onCreated(pickedSlot, result.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-5 rounded-3xl bg-white border border-brand-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs uppercase tracking-wider font-semibold text-brand-700">
            {t.newAppt.title}
          </h2>
          <p className="text-sm text-ink-500 mt-1">{t.newAppt.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="h-8 w-8 shrink-0 rounded-full text-ink-500 hover:bg-cream-100 flex items-center justify-center"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-5">
        {/* Columna izquierda: paciente + servicio */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            {t.newAppt.step1}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label={t.newAppt.email}
              hint={lookingUp ? t.newAppt.checking : existing ? t.newAppt.existing : undefined}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="patient@email.com"
                className={inputCls}
              />
            </Field>
            <Field label={t.newAppt.fullName}>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                readOnly={!!existing}
                className={`${inputCls} ${existing ? "bg-cream-50 text-ink-600" : ""}`}
              />
            </Field>
            <Field label={t.newAppt.phone}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+502 ..."
                className={inputCls}
              />
            </Field>
            <Field label={t.newAppt.timezone}>
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

          {existing && (
            <div className="rounded-2xl border border-cream-200 bg-cream-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                {t.packages.patientPackages}
              </p>
              {packages.length === 0 ? (
                <p className="mt-1 text-xs text-ink-500">{t.packages.noPackages}</p>
              ) : (
                <>
                  {packages.every((p) => p.remaining === 0) && (
                    <p className="mt-2 rounded-lg bg-amber-100 text-amber-900 text-xs px-3 py-2">
                      {t.packages.noneLeft}
                    </p>
                  )}
                  <div className="mt-2 space-y-1.5">
                    {packages.map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2 text-xs ${
                          p.remaining === 0 ? "text-ink-400" : "text-ink-800"
                        }`}
                      >
                        <input
                          type="radio"
                          name="nv-package"
                          disabled={p.remaining === 0}
                          checked={packageId === p.id}
                          onChange={() => {
                            setPackageId(p.id);
                            const svc = services.find((s) => s.id === p.serviceId);
                            if (svc) handleServiceChange(svc.slug);
                          }}
                        />
                        <span className="font-medium">{p.serviceName}</span>
                        <span>
                          · {p.usedSessions}/{p.totalSessions} · {p.remaining} {t.packages.remaining}
                        </span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2 text-xs text-ink-800">
                      <input
                        type="radio"
                        name="nv-package"
                        checked={packageId === ""}
                        onChange={() => setPackageId("")}
                      />
                      {t.packages.noPackage}
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 pt-2">
            {t.newAppt.step2}
          </p>
          <select
            value={serviceSlug}
            onChange={(e) => handleServiceChange(e.target.value)}
            disabled={!!packageId}
            className={`${inputCls} ${packageId ? "bg-cream-50 text-ink-600" : ""}`}
          >
            {services.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name} · {s.durationMin > 0 ? s.durationMin : 60} {t.newAppt.min}
              </option>
            ))}
          </select>

          {!packageId && (service?.sessions ?? 1) > 1 && (
            <div className="rounded-xl bg-brand-50 border border-brand-200 px-3 py-2 text-xs text-brand-900">
              <span className="font-semibold">{t.packages.newPackage}</span>{" "}
              {service?.name} · {service?.sessions} {t.packages.sessionsWord}. {t.packages.firstSession}{" "}
              {service?.sessions}.
            </div>
          )}

          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 pt-2">
            {t.newAppt.step4}
          </p>
          <ModalityToggle
            value={modality}
            onChange={setModality}
            label={t.modality.label}
            virtualLabel={t.modality.virtual}
            inPersonLabel={t.modality.inPerson}
          />
          {modality === "VIRTUAL" ? (
            <>
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className={inputCls}
              />
              <p className="text-[11px] text-ink-500 -mt-2">{t.newAppt.linkHint}</p>
            </>
          ) : (
            <p className="rounded-xl bg-cream-50 border border-cream-200 px-3 py-2 text-xs text-ink-600">
              {t.modality.inPersonHint}
            </p>
          )}

          <Field label={t.newAppt.notes}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={t.newAppt.notesPh}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Columna derecha: dia + hora */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-3">
            {t.newAppt.step3}
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
                <p className="text-sm text-ink-400 py-6 text-center">{t.newAppt.loadingServices}</p>
              )}
            </div>
            <div className="rounded-2xl border border-cream-200 p-3">
              {!selectedDate ? (
                <p className="text-sm text-ink-400 py-6 text-center">{t.newAppt.selectDay}</p>
              ) : slotsLoading ? (
                <p className="text-sm text-ink-400 py-6 text-center">{t.newAppt.lookingSlots}</p>
              ) : !slots || slots.length === 0 ? (
                <p className="text-sm text-ink-400 py-6 text-center">{t.newAppt.noSlots}</p>
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
                        <span className="font-medium">{fmtTime(iso, BUSINESS_TZ, dl)}</span>
                        {timezone && timezone !== BUSINESS_TZ && (
                          <span className={`ml-1.5 text-[11px] ${isPicked ? "text-white/80" : "text-ink-500"}`}>
                            ({safeFmtTime(iso, timezone, dl)} {t.common.patient})
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
          {submitting ? t.newAppt.creating : t.newAppt.create}
        </button>
        <span className="text-xs text-ink-500">
          {packageId && (
            <span className="block text-brand-700">
              {t.packages.deducting}{" "}
              {packages.find((p) => p.id === packageId)?.serviceName ?? ""}.
            </span>
          )}
          {pickedSlot
            ? `${service?.name ?? ""} · ${fmtDateTime(pickedSlot, BUSINESS_TZ, dl)}${
                timezone && timezone !== BUSINESS_TZ
                  ? ` (${safeFmtDateTime(pickedSlot, timezone, dl)} ${t.newAppt.forPatient})`
                  : ""
              }`
            : t.newAppt.pickAll}
        </span>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

function ModalityToggle({
  value,
  onChange,
  label,
  virtualLabel,
  inPersonLabel,
}: {
  value: "VIRTUAL" | "IN_PERSON";
  onChange: (m: "VIRTUAL" | "IN_PERSON") => void;
  label: string;
  virtualLabel: string;
  inPersonLabel: string;
}) {
  const btn = (m: "VIRTUAL" | "IN_PERSON", text: string) => (
    <button
      type="button"
      onClick={() => onChange(m)}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        value === m ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-cream-50"
      }`}
    >
      {text}
    </button>
  );
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs text-ink-600">{label}</span>
      <div className="inline-flex rounded-full bg-white border border-cream-200 p-1">
        {btn("VIRTUAL", virtualLabel)}
        {btn("IN_PERSON", inPersonLabel)}
      </div>
    </div>
  );
}

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

// La zona la escribe la secretaria; si no es valida no rompemos la pantalla.
function safeFmtTime(iso: string, tz: string, locale: string): string {
  try {
    return fmtTime(iso, tz, locale);
  } catch {
    return "?";
  }
}
function safeFmtDateTime(iso: string, tz: string, locale: string): string {
  try {
    return fmtDateTime(iso, tz, locale);
  } catch {
    return "?";
  }
}
