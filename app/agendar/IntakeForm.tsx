"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchServiceAvailability,
  fetchServiceSlots,
  submitIntake,
  localizedService,
  regionPrice,
  fetchPaymentSettings,
  type ApiService,
  type Region,
  type PublicPaymentSettings,
} from "../lib/api";
import { MonthCalendar } from "../components/MonthCalendar";
import { useT, useLocale } from "../lib/i18n";

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

// Solo la lógica de validación vive aquí; las etiquetas/hints se traducen.
const DOCUMENT_VALIDATORS: { type: DocumentType; validate: (v: string) => boolean }[] = [
  { type: "DPI", validate: (v) => /^\d{13}$/.test(v.replace(/[\s-]/g, "")) },
  {
    type: "CURP",
    validate: (v) =>
      /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i.test(v.replace(/[\s-]/g, "")),
  },
  {
    type: "PASSPORT",
    validate: (v) => /^[A-Z0-9]{5,15}$/i.test(v.replace(/[\s-]/g, "")),
  },
  { type: "OTHER", validate: (v) => v.replace(/[\s-]/g, "").length >= 3 },
];

function validatorFor(type: DocumentType) {
  return (
    DOCUMENT_VALIDATORS.find((d) => d.type === type) ?? DOCUMENT_VALIDATORS[0]
  );
}

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

export function IntakeForm({
  services,
  initialRegion = "GT",
}: {
  services: ApiService[];
  initialRegion?: Region;
}) {
  const { t, locale } = useLocale();
  const [step, setStep] = useState<Step>(1);
  const [region, setRegion] = useState<Region>(initialRegion);
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

  // Cambiar la región ajusta el tipo de documento: Guatemala exige DPI;
  // internacional no permite DPI (se pasa a pasaporte).
  function handleRegionChange(r: Region) {
    setRegion(r);
    setForm((prev) => {
      if (r === "GT" && prev.documentType !== "DPI") {
        return { ...prev, documentType: "DPI", documentId: "" };
      }
      if (r === "INTL" && prev.documentType === "DPI") {
        return { ...prev, documentType: "PASSPORT", documentId: "" };
      }
      return prev;
    });
  }

  function canAdvance(): boolean {
    if (step === 1) return form.serviceSlug !== "";
    if (step === 2) {
      return (
        form.fullName.trim().length >= 2 &&
        /\S+@\S+\.\S+/.test(form.email.trim()) &&
        validatorFor(form.documentType).validate(form.documentId) &&
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
      if (!form.receipt) throw new Error(t.agendar.errors.missingReceipt);
      const data = new FormData();
      data.append("serviceSlug", form.serviceSlug);
      data.append("region", region);
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
      setError(err instanceof Error ? err.message : t.agendar.errors.unknown);
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
          region={region}
          onRegionChange={handleRegionChange}
        />
      )}

      {step === 2 && (
        <StepData form={form} onChange={updateField} region={region} />
      )}

      {step === 3 && (
        <StepPayment
          form={form}
          service={selectedService}
          onChange={updateField}
          region={region}
        />
      )}

      {step === 4 && selectedService && (
        <StepHorario
          serviceSlug={selectedService.slug}
          serviceName={localizedService(selectedService, locale).name}
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
          ← {t.agendar.buttons.back}
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => canAdvance() && setStep((s) => (s + 1) as Step)}
            disabled={!canAdvance()}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t.agendar.buttons.continue}
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
              ? t.agendar.buttons.submitting
              : form.scheduledAt
                ? t.agendar.buttons.submit
                : t.agendar.buttons.skip}
          </button>
        )}
      </div>
    </div>
  );
}

function Stepper({ current }: { current: Step }) {
  const t = useT();
  const steps = [
    t.agendar.steps.service,
    t.agendar.steps.data,
    t.agendar.steps.payment,
    t.agendar.steps.schedule,
  ];
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
  region,
  onRegionChange,
}: {
  services: ApiService[];
  selected: string;
  onSelect: (slug: string) => void;
  region: Region;
  onRegionChange: (r: Region) => void;
}) {
  const { t, locale } = useLocale();
  return (
    <div>
      <h2 className="font-serif-display text-2xl sm:text-3xl text-gray-900">
        {t.agendar.service.title}
      </h2>
      <p className="mt-2 text-sm text-gray-600">{t.agendar.service.subtitle}</p>

      {/* Selector de región (define la moneda del precio) */}
      <div className="mt-5 rounded-2xl bg-cream-100 border border-cream-200 p-4">
        <p className="text-xs font-semibold text-gray-700">
          {t.agendar.region.title}
        </p>
        <div className="mt-2 inline-flex rounded-full bg-white border border-gray-200 p-1 text-sm">
          {(["GT", "INTL"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRegionChange(r)}
              className={`px-4 py-1.5 rounded-full font-medium transition-colors ${
                region === r
                  ? "bg-brand-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {r === "GT" ? t.agendar.region.gt : t.agendar.region.intl}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-gray-500">{t.agendar.region.hint}</p>
      </div>

      <div className="mt-6 space-y-3">
        {services.map((s) => {
          const isSelected = selected === s.slug;
          const loc = localizedService(s, locale);
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
                  <p className="font-semibold text-gray-900">{loc.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.billingType === "MONTHLY"
                      ? t.agendar.service.monthly
                      : `${s.durationMin} ${t.agendar.service.min}`}
                  </p>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {loc.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-serif-display text-2xl text-brand-700">
                    {regionPrice(s, region)}
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
  region,
}: {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  region: Region;
}) {
  const t = useT();
  const doc = t.agendar.documents[form.documentType];
  // Documentos permitidos según la región: Guatemala solo DPI; internacional
  // CURP / pasaporte / otro (DPI queda reservado al precio local).
  const allowedDocTypes: DocumentType[] =
    region === "GT" ? ["DPI"] : ["CURP", "PASSPORT", "OTHER"];
  return (
    <div>
      <h2 className="font-serif-display text-2xl sm:text-3xl text-gray-900">
        {t.agendar.data.title}
      </h2>
      <p className="mt-2 text-sm text-gray-600">{t.agendar.data.subtitle}</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t.agendar.data.fullName}>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder={t.agendar.data.fullNamePh}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </Field>

        <Field label={t.agendar.data.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder={t.agendar.data.emailPh}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </Field>

        <Field label={t.agendar.data.docType}>
          <select
            value={form.documentType}
            onChange={(e) => onChange("documentType", e.target.value as DocumentType)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            {allowedDocTypes.map((type) => (
              <option key={type} value={type}>
                {t.agendar.documents[type].label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={`${doc.label} *`}>
          <input
            type="text"
            inputMode={form.documentType === "DPI" ? "numeric" : "text"}
            value={form.documentId}
            onChange={(e) => onChange("documentId", e.target.value)}
            placeholder={doc.placeholder}
            maxLength={25}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono"
          />
          <p className="mt-1 text-[10px] text-gray-500">
            {doc.hint} {t.agendar.data.docHelpSuffix}
          </p>
        </Field>

        <Field label={t.agendar.data.phone}>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder={t.agendar.data.phonePh}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </Field>

        <Field label={t.agendar.data.timezone}>
          <input
            type="text"
            value={form.timezone}
            onChange={(e) => onChange("timezone", e.target.value)}
            readOnly
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600"
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label={t.agendar.data.goal}>
            <textarea
              value={form.goal}
              onChange={(e) => onChange("goal", e.target.value)}
              rows={3}
              placeholder={t.agendar.data.goalPh}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label={t.agendar.data.conditions}>
            <textarea
              value={form.conditions}
              onChange={(e) => onChange("conditions", e.target.value)}
              rows={2}
              placeholder={t.agendar.data.conditionsPh}
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
  region,
}: {
  form: FormState;
  service: ApiService | undefined;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  region: Region;
}) {
  const { t, locale } = useLocale();
  const serviceName = service ? localizedService(service, locale).name : "";
  return (
    <div>
      <h2 className="font-serif-display text-2xl sm:text-3xl text-gray-900">
        {t.agendar.payment.title}
      </h2>
      <p className="mt-2 text-sm text-gray-600">{t.agendar.payment.subtitle}</p>

      <div className="mt-6 rounded-2xl bg-cream-100 border border-cream-300 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          {t.agendar.payment.summary}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{serviceName}</p>
            <p className="text-xs text-gray-500">
              {service?.billingType === "MONTHLY"
                ? t.agendar.payment.monthly
                : `${service?.durationMin} ${t.agendar.payment.min}`}
            </p>
          </div>
          <p className="font-serif-display text-3xl text-brand-700">
            {service ? regionPrice(service, region) : ""}
          </p>
        </div>
      </div>

      <BankDetails />

      <div className="mt-6">
        <FileDrop file={form.receipt} onFile={(f) => onChange("receipt", f)} />
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
  const t = useT();
  const dateLocale = t.dateLocale;
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
        {t.agendar.schedule.title}
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        {serviceName} · {durationMin} {t.agendar.schedule.min}. {t.agendar.schedule.note}
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
            {t.agendar.schedule.availableOn} {fmtSelectedDate(selectedDate, dateLocale)}
          </p>
          {slotsLoading ? (
            <p className="text-sm text-gray-500">{t.agendar.schedule.searching}</p>
          ) : !slots || slots.length === 0 ? (
            <p className="text-sm text-gray-500">{t.agendar.schedule.none}</p>
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
                        {fmtTime(iso, patientTimezone)} {t.agendar.schedule.yourTime}
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
          <strong>{t.agendar.schedule.tentative}</strong>{" "}
          {fmtFullDate(selected, BUSINESS_TZ, dateLocale)}
          {patientTimezone !== BUSINESS_TZ && (
            <span className="block text-xs text-brand-700/80 mt-0.5">
              {fmtFullDate(selected, patientTimezone, dateLocale)} ({t.agendar.schedule.yourTime})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function fmtSelectedDate(dateStr: string, locale: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0));
  return date.toLocaleDateString(locale, {
    timeZone: BUSINESS_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function fmtTime(iso: string, tz: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function fmtFullDate(iso: string, tz: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
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
  const t = useT();
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
            {(file.size / 1024).toFixed(0)} KB · {t.agendar.fileDrop.changeHint}
          </p>
        </>
      ) : (
        <>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <p className="text-sm font-medium text-gray-900">
            {t.agendar.fileDrop.uploadTitle}
          </p>
          <p className="text-xs text-gray-500">{t.agendar.fileDrop.uploadHint}</p>
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
  const t = useT();
  const dateLocale = t.dateLocale;
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-700">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="mt-6 font-serif-display text-3xl text-gray-900">
        {t.agendar.success.title}
      </h2>
      <p className="mt-3 text-gray-600 max-w-md mx-auto">{message}</p>

      {scheduledAt && (
        <div className="mt-6 inline-block text-left rounded-2xl bg-brand-50 border border-brand-200 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-1">
            {t.agendar.success.tentative}
          </p>
          <p className="text-sm font-medium text-gray-900">
            {fmtFullDate(scheduledAt, BUSINESS_TZ, dateLocale)}{" "}
            <span className="text-xs font-normal text-gray-500">
              ({t.agendar.success.guatemala})
            </span>
          </p>
          {patientTimezone !== BUSINESS_TZ && (
            <p className="text-xs text-gray-600 mt-0.5">
              {fmtFullDate(scheduledAt, patientTimezone, dateLocale)} ({t.agendar.success.yourTime})
            </p>
          )}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-cream-100 border border-cream-300 p-5 text-left max-w-md mx-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-3">
          {t.agendar.success.nextStepsTitle}
        </p>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="font-semibold text-brand-700">1.</span>
            {t.agendar.success.step1}
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-brand-700">2.</span>
            {scheduledAt
              ? t.agendar.success.step2WithSchedule
              : t.agendar.success.step2NoSchedule}
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-brand-700">3.</span>
            {t.agendar.success.step3}
          </li>
        </ol>
      </div>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        ← {t.agendar.success.backHome}
      </Link>
    </div>
  );
}

/**
 * Datos para el deposito. Vienen del panel (tabla payment_settings) en vez de
 * estar escritos aqui, para que la nutricionista pueda cambiar la cuenta sin
 * redesplegar. Mientras no los configure mostramos un aviso en lugar de datos
 * de relleno: nadie deberia transferir a una cuenta inventada.
 */
function BankDetails() {
  const t = useT();
  const [bank, setBank] = useState<PublicPaymentSettings | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPaymentSettings()
      .then((s) => {
        if (!cancelled) setBank(s);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed || (bank && !bank.configured)) {
    return (
      <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-900">
        {t.agendar.payment.depositUnavailable}
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-200 p-5 text-sm text-gray-500">
        {t.agendar.payment.depositLoading}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-200 p-5 text-sm text-gray-700">
      <p className="font-semibold mb-2">{t.agendar.payment.depositTitle}</p>
      <ul className="space-y-1 text-xs">
        <li>
          <strong>{t.agendar.payment.bankLabel}</strong> {bank.bankName}
        </li>
        {bank.accountType && (
          <li>
            <strong>{t.agendar.payment.accountTypeLabel}</strong>{" "}
            {bank.accountType}
          </li>
        )}
        <li>
          <strong>{t.agendar.payment.accountLabel}</strong> {bank.accountNumber}
        </li>
        {bank.accountHolder && (
          <li>
            <strong>{t.agendar.payment.nameLabel}</strong> {bank.accountHolder}
          </li>
        )}
      </ul>
      {bank.instructions && (
        <p className="mt-3 text-xs text-gray-600 whitespace-pre-line">
          {bank.instructions}
        </p>
      )}
    </div>
  );
}
