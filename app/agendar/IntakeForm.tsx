"use client";

import { useState } from "react";
import Link from "next/link";
import { submitIntake, type ApiService } from "../lib/api";

type Step = 1 | 2 | 3;

interface FormState {
  serviceSlug: string;
  fullName: string;
  email: string;
  phone: string;
  whatsappNotify: boolean;
  timezone: string;
  goal: string;
  conditions: string;
  receipt: File | null;
}

const initialForm: FormState = {
  serviceSlug: "",
  fullName: "",
  email: "",
  phone: "",
  whatsappNotify: false,
  timezone:
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "America/Guatemala",
  goal: "",
  conditions: "",
  receipt: null,
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

  function canAdvance(): boolean {
    if (step === 1) return form.serviceSlug !== "";
    if (step === 2) {
      return (
        form.fullName.trim().length >= 2 &&
        /\S+@\S+\.\S+/.test(form.email.trim()) &&
        form.goal.trim().length > 0
      );
    }
    return form.receipt !== null;
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
      if (form.phone) data.append("phone", form.phone.trim());
      data.append("whatsappNotify", form.whatsappNotify ? "true" : "false");
      data.append("timezone", form.timezone);
      data.append("goal", form.goal.trim());
      if (form.conditions) data.append("conditions", form.conditions.trim());
      data.append("receipt", form.receipt);

      const result = await submitIntake(data);
      setSuccess({ intakeId: result.intakeId, message: result.message });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return <SuccessView message={success.message} />;
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
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

        {step < 3 ? (
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
            disabled={!canAdvance() || submitting}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Enviando…" : "Enviar solicitud"}
          </button>
        )}
      </div>
    </div>
  );
}

function Stepper({ current }: { current: Step }) {
  const steps = ["Servicio", "Tus datos", "Pago"];
  return (
    <ol className="flex items-center justify-between mb-8 max-w-md mx-auto">
      {steps.map((label, idx) => {
        const num = (idx + 1) as Step;
        const done = num < current;
        const active = num === current;
        return (
          <li key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={`h-7 w-7 rounded-full text-xs font-semibold flex items-center justify-center ${
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
              <span
                className={`text-xs font-medium ${
                  active ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <span
                className={`mx-3 h-px flex-1 ${
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

        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.whatsappNotify}
              onChange={(e) => onChange("whatsappNotify", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">
              Quiero recibir recordatorios por WhatsApp además del correo.
            </span>
          </label>
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
            <strong>Nombre:</strong> NutriVerde
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

function SuccessView({ message }: { message: string }) {
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
            Te enviamos un correo con un enlace para elegir tu horario.
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
