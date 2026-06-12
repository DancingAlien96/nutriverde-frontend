"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminShell } from "../../AdminShell";
import {
  DOCUMENT_TYPE_LABEL,
  downloadExpedientePdf,
  formatCents,
  getPatient,
  type PatientDetail,
  type PatientStats,
} from "../../../lib/admin";
import {
  DiagnosesSection,
  MealPlansSection,
  MeasurementsSection,
  StaticHealthSection,
  TrainingsSection,
} from "./ClinicalSections";
import { ProgressCharts } from "./ProgressCharts";

export default function PatientExpedientePage() {
  return (
    <AdminShell>
      <Content />
    </AdminShell>
  );
}

function Content() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  async function handleDownloadPdf() {
    if (!patient) return;
    setDownloadingPdf(true);
    try {
      await downloadExpedientePdf(
        patient.id,
        `expediente-${patient.fullName.replace(/\s+/g, "_")}`,
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not download the PDF");
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function reload() {
    if (!id) return;
    try {
      const { patient: p, stats: s } = await getPatient(id);
      setPatient(p);
      setStats(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getPatient(id)
      .then(({ patient: p, stats: s }) => {
        if (!cancelled) {
          setPatient(p);
          setStats(s);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (error)
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  if (!patient) return null;

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/admin/patients"
          className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1.5 shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back to list</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 hover:bg-ink-800 disabled:opacity-60 px-4 py-2 text-xs sm:text-sm font-medium text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          {downloadingPdf ? "Generating…" : "Download PDF"}
        </button>
      </div>

      {/* Header */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-serif-display text-2xl sm:text-3xl text-gray-900">
              {patient.fullName}
            </h1>
            <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-700">
              <InfoRow label="Email" value={patient.email} />
              <InfoRow
                label={DOCUMENT_TYPE_LABEL[patient.documentType]}
                value={patient.documentId ?? "—"}
                mono
              />
              <InfoRow label="Phone" value={patient.phone ?? "—"} />
              <InfoRow label="Time zone" value={patient.timezone} />
              <InfoRow
                label="WhatsApp"
                value={patient.whatsappNotify ? "Yes" : "No"}
              />
              <InfoRow
                label="Registered"
                value={formatDate(patient.createdAt)}
              />
            </dl>
          </div>
          {stats && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 sm:shrink-0">
              <Stat
                value={stats.totalAppointments.toString()}
                label="Total appointments"
              />
              <Stat
                value={stats.completedAppointments.toString()}
                label="Completed"
              />
              <Stat
                value={
                  stats.totalPaidCents > 0
                    ? formatCents(stats.totalPaidCents, "GTQ")
                    : "Q0"
                }
                label="Paid"
              />
            </div>
          )}
        </div>
      </section>

      {/* Static clinical data */}
      <StaticHealthSection patient={patient} onSaved={reload} />

      {/* Diagnosis and goals */}
      <DiagnosesSection
        patientId={patient.id}
        diagnoses={patient.diagnoses}
        onChanged={reload}
      />

      {/* Training */}
      <TrainingsSection
        patientId={patient.id}
        trainings={patient.trainings}
        onChanged={reload}
      />

      {/* Anthropometric measurements */}
      <MeasurementsSection
        patientId={patient.id}
        measurements={patient.measurements}
        onChanged={reload}
      />

      {/* Progress charts */}
      <ProgressCharts measurements={patient.measurements} />

      {/* Structured meal plan */}
      <MealPlansSection
        patientId={patient.id}
        mealPlans={patient.mealPlans}
        onChanged={reload}
      />

      {/* Appointments */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Appointments and consultations</h2>
        {patient.appointments.length === 0 ? (
          <p className="text-sm text-gray-500">No appointments recorded.</p>
        ) : (
          <ul className="space-y-3">
            {patient.appointments.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">
                      {a.service.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {a.scheduledAt
                        ? formatDate(a.scheduledAt)
                        : "No time scheduled"}
                      {" · "}
                      {a.durationMin} min
                    </p>
                  </div>
                  <AppointmentStatusPill status={a.status} />
                </div>

                {a.payment && (
                  <p className="mt-2 text-xs text-gray-600">
                    Payment: {paymentStatusLabel(a.payment.status)} ·{" "}
                    {formatCents(a.payment.amountCents, a.payment.currency)}
                    {a.payment.id && (
                      <>
                        {" · "}
                        <Link
                          href={`/admin/payments/${a.payment.id}`}
                          className="text-brand-700 hover:underline"
                        >
                          view payment →
                        </Link>
                      </>
                    )}
                  </p>
                )}

                {a.meetingUrl && (
                  <p className="mt-1 text-xs text-gray-600 truncate">
                    Meeting:{" "}
                    <a
                      href={a.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-700 hover:underline break-all"
                    >
                      {a.meetingUrl}
                    </a>
                  </p>
                )}

                {a.nutritionPlan && (
                  <p className="mt-1 text-xs text-brand-700">
                    📄 Plan sent: {a.nutritionPlan.title}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Intake forms */}
      {patient.intakeForms.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Submitted forms
          </h2>
          <ul className="space-y-4">
            {patient.intakeForms.map((f) => (
              <li
                key={f.id}
                className="rounded-xl border border-gray-100 p-4 text-sm"
              >
                <p className="text-xs text-gray-500">
                  {formatDate(f.submittedAt)} · service: {f.serviceSlug}
                </p>
                <dl className="mt-2 space-y-2">
                  {f.data.goal && (
                    <BlockField label="Goal" value={f.data.goal} />
                  )}
                  {f.data.conditions && (
                    <BlockField label="Conditions" value={f.data.conditions} />
                  )}
                  {f.data.notes && (
                    <BlockField label="Notes" value={f.data.notes} />
                  )}
                </dl>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Payments */}
      {patient.payments.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Payment history</h2>
          <ul className="space-y-2">
            {patient.payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{p.service.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(p.createdAt)} ·{" "}
                    {paymentStatusLabel(p.status)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {formatCents(p.amountCents, p.currency)}
                  </span>
                  <Link
                    href={`/admin/payments/${p.id}`}
                    className="text-xs text-brand-700 hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {patient.nutritionPlans.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Nutrition plans</h2>
          <ul className="space-y-2 text-sm">
            {patient.nutritionPlans.map((np) => (
              <li
                key={np.id}
                className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{np.title}</p>
                  <p className="text-xs text-gray-500">
                    {np.sentAt
                      ? `Sent ${formatDate(np.sentAt)}`
                      : "Pending submission"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <dt className="text-xs text-gray-500 shrink-0 w-24">{label}</dt>
      <dd
        className={`text-sm text-gray-800 break-all ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-cream-100 border border-cream-300 px-3 py-2 text-center">
      <p className="font-serif-display text-lg sm:text-xl text-brand-700">
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-gray-600 mt-0.5">
        {label}
      </p>
    </div>
  );
}

function BlockField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-800 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function AppointmentStatusPill({ status }: { status: string }) {
  const label = appointmentStatusLabel(status);
  const cls =
    status === "SCHEDULED" || status === "PAYMENT_APPROVED"
      ? "bg-brand-100 text-brand-800 border-brand-200"
      : status === "COMPLETED"
        ? "bg-gray-900 text-white border-gray-900"
        : status === "AWAITING_PAYMENT" || status === "PENDING_CONFIRMATION"
          ? "bg-amber-100 text-amber-800 border-amber-200"
          : "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function appointmentStatusLabel(status: string): string {
  switch (status) {
    case "AWAITING_PAYMENT":
      return "Awaiting payment";
    case "PAYMENT_APPROVED":
      return "Pending scheduling";
    case "PENDING_CONFIRMATION":
      return "To be confirmed";
    case "SCHEDULED":
      return "Scheduled";
    case "COMPLETED":
      return "Completed";
    case "CANCELED":
      return "Canceled";
    case "NO_SHOW":
      return "No-show";
    default:
      return status;
  }
}

function paymentStatusLabel(status: string): string {
  switch (status) {
    case "PENDING_REVIEW":
      return "Pending";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
