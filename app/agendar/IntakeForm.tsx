"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchServiceAvailability,
  fetchServiceSlots,
  submitIntake,
  type ApiService,
} from "../lib/api";
import { MonthCalendar } from "../components/MonthCalendar";

type Step = 1 | 2 | 3 | 4;

const BUSINESS_TZ = "America/Guatemala";

type DocumentType = "DPI" | "CURP" | "PASSPORT" | "OTHER";

interface FormState {
  serviceSlug: string;
  fullName: string;
  email: string;
  documentType: DocumentType;
  documentId: string;
  phone: string;
  whatsappNotify: boolean;
  timezone: string;
  goal: string;
  conditions: string;
  receipt: File | null;
  scheduledAt: string | null; // ISO UTC, opcional
}

const DOCUMENT_OPTIONS: {
  type: DocumentType;
  label: string;
  placeholder: string;
  hint: string;
  validate: (v: string) => boolean;
}[] = [
  {
    type: "DPI",
    label: "DPI (Guatemala)",
    placeholder: "1234 56789 0123",
    hint: "13 dígitos.",
    validate: (v) => /^\d{13}$/.test(v.replace(/[\s-]/g, "")),
  },
  {
    type: "CURP",
    label: "CURP (México)",
    placeholder: "GOMR980613HDFLRD09",
    hint: "18 caracteres alfanuméricos.",
    validate: (v) =>
      /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i.test(v.replace(/[\s-]/g, "")),
  },
  {
    type: "PASSPORT",
    label: "Pasaporte",
    placeholder: "P12345678",
    hint: "5 a 15 caracteres alfanuméricos.",
    validate: (v) => /^[A-Z0-9]{5,15}$/i.test(v.replace(/[\s-]/g, "")),
  },
  {
    type: "OTHER",
    label: "Otro documento",
    placeholder: "Número o código",
    hint: "Cualquier identificación oficial.",
    validate: (v) => v.replace(/[\s-]/g, "").length >= 3,
  },
];

const initialForm: FormState = {
  serviceSlug: "",
  fullName: "",
  email: "",
  documentType: "DPI",
  documentId: "",
  phone: "",
  whatsappNotify: false,
  timezone:
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "America/Guatemala",
  goal: "",
  conditions: "",
  receipt: null,
  scheduledAt: null,
};

export function IntakeForm({ services }: { services: ApiService[] }) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    intakeId: string;
    message: string;
  } | null>(null);

  const selectedService = services.find((s) => s.slug === form.serviceSlug);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const docOption =
    DOCUMENT_OPTIONS.find((d) => d.type === form.documentType) ??
    DOCUMENT_OPTIONS[0];

  function canAdvance(): boolean {
    if (step === 1) return form.serviceSlug !== "";
    if (step === 2) {
      return (
        form.fullName.trim().length >= 2 &&
        /\S+@\S+\.\S+/.test(form.email.trim()) &&
        docOption.validate(form.documentId) &&
        form.goal.trim().length > 0
      );
    }
    if (step === 3) return form.receipt !== null;
    return true; // step 4: horario es opcional
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);

    try {
      if (!form.receipt) throw new Error("Falta el comprobante.");
      const data = new FormData();
      data.append("serviceSlug", form.serviceSlug);
      data.append("fullName", form.fullName.trim());
      data.append("email", form.email.trim());
      data.append("documentType", form.documentType);
      data.append("documentId", form.documentId.replace(/[\s-]/g, ""));
      if (form.phone) data.append("phone", form.phone.trim());
      data.append("whatsappNotify", form.whatsappNotify ? "true" : "false");
      data.append("timezone", form.timezone);
      data.append("goal", form.goal.trim());
      if (form.conditions) data.append("conditions", form.conditions.trim());
      data.append("receipt", form.receipt);
      if (form.scheduledAt) data.append("scheduledAt", form.scheduledAt);

      const result = await submitIntake(data);
      setSuccess({ intakeId: result.intakeId, message: result.message });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <SuccessView
        message={success.message}
        scheduledAt={form.scheduledAt}
        patientTimezone={form.timezone}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-10">
      <Stepper current={step} />

      {step === 1 && (
        <StepService
          services={services}
          selected={form.serviceSlug}
          onSelect={(slug) => updateField("serviceSlug", slug)}
        />
      )}

      {step === 2 && (
        <StepData
          form={form}
          onChange={updateField}
        />
      )}

      {step === 3 && (
        <StepPayment
          form={form}
          service={selectedService}
          onChange={updateField}
        />
      )}

      {step === 4 && selectedService && (
        <StepHorario
          serviceSlug={selectedService.slug}
          serviceName={selectedService.name}
          durationMin={selectedService.durationMin}
          patientTimezone={form.timezone}
          selected={form.scheduledAt}
          onSelect={(iso) => updateField("scheduledAt", iso)}
        />
      )}

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
          disabled={step === 1 || submitting}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Atrás
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => canAdvance() && setStep((s) => (s + 1) as Step)}
            disabled={!canAdvance()}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continuar
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting
              ? "Enviando…"
              : form.scheduledAt
                ? "Enviar solicitud"
                : "Omitir y enviar"}
          </button>
        )}
      </div>
    </div>
  );
}

function Stepper({ current }: { current: Step }) {
  const steps = ["Servicio", "Tus datos", "Pago", "Horario"];
  return (
    <ol className="flex items-center justify-between mb-8 max-w-md mx-auto">
      {steps.map((label, idx) => {
        const num = (idx + 1) as Step;
        const done = num < current;
        const active = num === current;
        return (
          <li key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`h-7 w-7 shrink-0 rounded-full text-xs font-semibold flex items-center justify-center ${
                  done
                    ? "bg-brand-600 text-white"
                    : active
                      ? "bg-brand-100 text-brand-700 ring-2 ring-brand-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  num
                )}
              </span>
              {/* En mobile solo mostramos el label del paso activo, los otros se ocultan para evitar overflow */}
              <span
                className={`text-xs font-medium truncate ${
                  active
                    ? "text-gray-900 inline"
                    : "text-gray-500 hidden sm:inline"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <span
                className={`mx-2 sm:mx-3 h-px flex-1 ${
                  done ? "bg-brand-500" : "bg-gray-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepService({
  services,
  selected,
  onSelect,
}: {
  services: ApiService[];
  selected: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div>
      <h2 className="font-serif-display text-2xl sm:text-3xl text-gray-900">
        Elige tu servicio
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Selecciona el tipo de consulta que mejor se adapte a ti.
      </p>

      <div className="mt-6 space-y-3">
        {services.map((s) => {
          const isSelected = selected === s.slug;
          return (
            <button
              type="button"
              key={s.slug}
              onClick={() => onSelect(s.slug)}
              className={`w-full text-left rounded-2xl border p-5 transition-all ${
                isSelected
                  ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-600/20"
                  : "border-gray-200 hover:border-brand-300"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.billingType === "MONTHLY"
                      ? "Mensual"
                      : `${s.durationMin} min`}
                  </p>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {s.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-serif-display text-2xl text-brand-700">
                    {s.priceFormatted}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepData({
  form,
  onChange,
}: {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div>
      <h2 className="font-serif-display text-2xl sm:text-3xl text-gray-900">
        Cuéntanos sobre ti
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Necesitamos tus datos para coordinar la consulta y enviarte el plan.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre completo *">
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Ej. María González"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </Field>

        <Field label="Correo electrónico *">
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </Field>

        <Field label="Tipo de documento *">
          <select
            value={form.documentType}
            onChange={(e) => onChange("documentType", e.target.value as DocumentType)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            {DOCUMENT_OPTIONS.map((opt) => (
              <option key={opt.type} value={opt.type}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={`${
            DOCUMENT_OPTIONS.find((d) => d.type === form.documentType)?.label ??
            "Documento"
          } *`}
        >
          <input
            type="text"
            inputMode={form.documentType === "DPI" ? "numeric" : "text"}
            value={form.documentId}
            onChange={(e) => onChange("documentId", e.target.value)}
            placeholder={
              DOCUMENT_OPTIONS.find((d) => d.type === form.documentType)
                ?.placeholder ?? ""
            }
            maxLength={25}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono"
          />
          <p className="mt-1 text-[10px] text-gray-500">
            {DOCUMENT_OPTIONS.find((d) => d.type === form.documentType)?.hint}
            {" "}Nos permite reconocerte en futuras consultas.
          </p>
        </Field>

        <Field label="Teléfono / WhatsApp">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+502 0000 0000"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </Field>

        <Field label="Zona horaria">
          <input
            type="text"
            value={form.timezone}
            onChange={(e) => onChange("timezone", e.target.value)}
            readOnly
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600"
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="¿Cuál es tu objetivo? *">
            <textarea
              value={form.goal}
              onChange={(e) => onChange("goal", e.target.value)}
              rows={3}
              placeholder="Ej. Bajar 5 kilos en 3 meses, mejorar mi energía, controlar mi diabetes…"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="¿Tienes alguna condición médica o alergia?">
            <textarea
              value={form.conditions}
              onChange={(e) => onChange("conditions", e.target.value)}
              rows={2}
              placeholder="Diabetes, hipertensión, alergias, restricciones alimentarias…"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function StepPayment({
  form,
  service,
  onChange,
}: {
  form: FormState;
  service: ApiService | undefined;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div>
      <h2 className="font-serif-display text-2xl sm:text-3xl text-gray-900">
        Sube tu comprobante de pago
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Realiza el pago por transferencia o depósito y sube el comprobante.
        Verificamos manualmente en máximo 24 horas.
      </p>

      <div className="mt-6 rounded-2xl bg-cream-100 border border-cream-300 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          Resumen
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{service?.name}</p>
            <p className="text-xs text-gray-500">
              {service?.billingType === "MONTHLY"
                ? "Mensual"
                : `${service?.durationMin} min`}
            </p>
          </div>
          <p className="font-serif-display text-3xl text-brand-700">
            {service?.priceFormatted}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-200 p-5 text-sm text-gray-700">
        <p className="font-semibold mb-2">Datos para el depósito:</p>
        <ul className="space-y-1 text-xs">
          <li>
            <strong>Banco:</strong> (configurar) — completar en producción
          </li>
          <li>
            <strong>Cuenta:</strong> 000-00000-0
          </li>
          <li>
            <strong>Nombre:</strong> Plenha Nutrition
          </li>
        </ul>
      </div>

      <div className="mt-6">
        <FileDrop
          file={form.receipt}
          onFile={(f) => onChange("receipt", f)}
        />
      </div>
    </div>
  );
}

function StepHorario({
  serviceSlug,
  serviceName,
  durationMin,
  patientTimezone,
  selected,
  onSelect,
}: {
  serviceSlug: string;
  serviceName: string;
  durationMin: number;
  patientTimezone: string;
  selected: string | null;
  onSelect: (iso: string | null) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const fetchAvailability = useCallback(
    (month: string) => fetchServiceAvailability(serviceSlug, month),
    [serviceSlug],
  );

  useEffect(() => {
    if (!selectedDate) {
      setSlots(null);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSlots(null);
    fetchServiceSlots(serviceSlug, selectedDate)
      .then((data) => {
        if (!cancelled) {
          setSlots(data.slots);
          setSlotsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setSlotsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [serviceSlug, selectedDate]);

  return (
    <div>
      <h2 className="font-serif-display text-2xl sm:text-3xl text-gray-900">
        Elige tu horario (opcional)
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        {serviceName} · {durationMin} min. Cuando aprobemos tu pago confirmaremos
        este horario. Si lo dejas en blanco, te enviaremos un link para elegirlo
        después.
      </p>

      <div className="mt-6 bg-gray-50 rounded-2xl p-4 max-w-md mx-auto">
        <MonthCalendar
          fetchAvailability={fetchAvailability}
          selectedDate={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date);
            onSelect(null);
          }}
        />
      </div>

      {selectedDate && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Horario disponible · {fmtSelectedDate(selectedDate)}
          </p>
          {slotsLoading ? (
            <p className="text-sm text-gray-500">Buscando horarios…</p>
          ) : !slots || slots.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay horarios disponibles ese día.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {slots.map((iso) => {
                const isPicked = iso === selected;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => onSelect(iso === selected ? null : iso)}
                    className={`rounded-xl border px-3 py-2.5 text-sm transition-colors text-center ${
                      isPicked
                        ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600/20"
                        : "border-gray-200 hover:border-brand-300 bg-white"
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {fmtTime(iso, BUSINESS_TZ)}
                    </div>
                    {patientTimezone !== BUSINESS_TZ && (
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {fmtTime(iso, patientTimezone)} tu hora
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="mt-4 rounded-xl bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-800">
          <strong>Horario tentativo:</strong> {fmtFullDate(selected, BUSINESS_TZ)}
          {patientTimezone !== BUSINESS_TZ && (
            <span className="block text-xs text-brand-700/80 mt-0.5">
              {fmtFullDate(selected, patientTimezone)} (tu hora)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function fmtSelectedDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0));
  return date.toLocaleDateString("es-GT", {
    timeZone: BUSINESS_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function fmtTime(iso: string, tz: string): string {
  return new Date(iso).toLocaleTimeString("es-GT", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function fmtFullDate(iso: string, tz: string): string {
  return new Date(iso).toLocaleString("es-GT", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function FileDrop({
  file,
  onFile,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  return (
    <label
      htmlFor="receipt-input"
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed cursor-pointer transition-colors px-6 py-10 text-center ${
        file
          ? "border-brand-400 bg-brand-50/40"
          : "border-gray-300 hover:border-brand-400 bg-white"
      }`}
    >
      <input
        id="receipt-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
            <path d="M9 12l2 2 4-4" />
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024).toFixed(0)} KB · Click para cambiar
          </p>
        </>
      ) : (
        <>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <p className="text-sm font-medium text-gray-900">
            Click para subir tu comprobante
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, WebP, HEIC o PDF — máximo 10 MB
          </p>
        </>
      )}
    </label>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function SuccessView({
  message,
  scheduledAt,
  patientTimezone,
}: {
  message: string;
  scheduledAt: string | null;
  patientTimezone: string;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-700">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="mt-6 font-serif-display text-3xl text-gray-900">
        ¡Recibimos tu solicitud!
      </h2>
      <p className="mt-3 text-gray-600 max-w-md mx-auto">{message}</p>

      {scheduledAt && (
        <div className="mt-6 inline-block text-left rounded-2xl bg-brand-50 border border-brand-200 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-1">
            Horario tentativo
          </p>
          <p className="text-sm font-medium text-gray-900">
            {fmtFullDate(scheduledAt, BUSINESS_TZ)}{" "}
            <span className="text-xs font-normal text-gray-500">(Guatemala)</span>
          </p>
          {patientTimezone !== BUSINESS_TZ && (
            <p className="text-xs text-gray-600 mt-0.5">
              {fmtFullDate(scheduledAt, patientTimezone)} (tu hora)
            </p>
          )}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-cream-100 border border-cream-300 p-5 text-left max-w-md mx-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-3">
          Próximos pasos
        </p>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="font-semibold text-brand-700">1.</span>
            Revisamos tu comprobante (máximo 24 horas).
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-brand-700">2.</span>
            {scheduledAt
              ? "Confirmamos tu pago y tu horario; luego te enviamos la confirmación final."
              : "Te enviamos un correo con un enlace para elegir tu horario."}
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-brand-700">3.</span>
            Recibes el link de la videollamada antes de la cita.
          </li>
        </ol>
      </div>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        ← Volver al inicio
      </Link>
    </div>
  );
}
