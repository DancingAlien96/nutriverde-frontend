"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminShell } from "../../AdminShell";
import { adminMe, isSecretary } from "../../../lib/admin";
import {
  DOCUMENT_TYPE_LABEL,
  deleteAppointment,
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
import { ChargePanel, ChargeStatusChip } from "../../ChargePanel";
import { Collapse } from "../../Collapse";
import {
  CollapsibleSection,
  SectionsProvider,
  SectionsToolbar,
} from "../../CollapsibleSection";
import { ChevronDownIcon } from "../../icons";
import { formatMoney } from "../../../lib/admin";
import { useAdminT, type AdminDict } from "../../../lib/admin-i18n";

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
  const t = useAdminT();

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // La secretaria ve del expediente solo contacto, paquetes, citas,
  // formularios y pagos: nada clinico ni el PDF (la API tampoco se lo da).
  // Tampoco corrige precios ni borra abonos. Cerrado por defecto: hasta
  // confirmar el rol (o si falla) se trata como restringido para no ofrecer
  // acciones que darian 403.
  const [role, setRole] = useState<"full" | "restricted" | null>(null);
  useEffect(() => {
    adminMe()
      .then((me) => setRole(isSecretary(me.admin.role) ? "restricted" : "full"))
      .catch(() => setRole("restricted"));
  }, []);
  const secretary = role !== "full";

  async function handleDownloadPdf() {
    if (!patient) return;
    setDownloadingPdf(true);
    try {
      await downloadExpedientePdf(
        patient.id,
        `expediente-${patient.fullName.replace(/\s+/g, "_")}`,
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : t.record.pdfError);
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleDeleteAppointment(appointmentId: string) {
    if (!window.confirm(t.record.appointments.deleteConfirm)) return;
    setDeletingId(appointmentId);
    try {
      await deleteAppointment(appointmentId);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : t.record.appointments.deleteError);
    } finally {
      setDeletingId(null);
    }
  }

  async function reload() {
    if (!id) return;
    try {
      const { patient: p, stats: s } = await getPatient(id);
      setPatient(p);
      setStats(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
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
          // Cadena vacía = error genérico; el texto se resuelve al renderizar
          // para que el efecto no dependa del diccionario.
          setError(err instanceof Error ? err.message : "");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="text-sm text-gray-500">{t.common.loading}</div>;
  if (error !== null)
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {error || t.common.error}
      </div>
    );
  if (!patient) return null;

  const sessionsLeft = (patient.packages ?? []).reduce((sum, k) => sum + k.remaining, 0);

  return (
    <SectionsProvider storageKey="nutriverde_admin_record_sections">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/admin/patients"
          className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1.5 shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">{t.record.backToList}</span>
          <span className="sm:hidden">{t.record.back}</span>
        </Link>
        {!secretary && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 hover:bg-ink-800 disabled:opacity-60 px-4 py-2 text-xs sm:text-sm font-medium text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            {downloadingPdf ? t.record.generating : t.record.downloadPdf}
          </button>
        )}
      </div>

      {/* Header */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-serif-display text-2xl sm:text-3xl text-gray-900">
              {patient.fullName}
            </h1>
            <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-700">
              <InfoRow label={t.record.info.email} value={patient.email} />
              <InfoRow
                label={DOCUMENT_TYPE_LABEL[patient.documentType]}
                value={patient.documentId ?? "—"}
                mono
              />
              <InfoRow label={t.record.info.phone} value={patient.phone ?? "—"} />
              <InfoRow label={t.record.info.timezone} value={patient.timezone} />
              <InfoRow
                label={t.record.info.whatsapp}
                value={patient.whatsappNotify ? t.record.info.yes : t.record.info.no}
              />
              <InfoRow
                label={t.record.info.registered}
                value={formatDate(patient.createdAt, t.dateLocale)}
              />
            </dl>
          </div>
          {stats && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 sm:shrink-0">
              <Stat
                value={stats.totalAppointments.toString()}
                label={t.record.stats.total}
              />
              <Stat
                value={stats.completedAppointments.toString()}
                label={t.record.stats.completed}
              />
              <Stat
                value={
                  stats.totalPaidCents > 0
                    ? formatCents(stats.totalPaidCents, "GTQ")
                    : "Q0"
                }
                label={
                  (stats.balanceCents ?? 0) > 0
                    ? `${t.record.stats.paidOwes} ${formatMoney(stats.balanceCents ?? 0, "GTQ")}`
                    : t.record.stats.paid
                }
              />
            </div>
          )}
        </div>
      </section>

      {/* Cada tarjeta es una seccion que se despliega hacia abajo. */}
      <SectionsToolbar expandLabel={t.record.expandAll} collapseLabel={t.record.collapseAll} />

      {/* Datos clinicos: solo nutricionista/staff. La secretaria no los ve
          (y la API no se los manda). */}
      {!secretary && (
        <>
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
        </>
      )}

      {/* Session packages: cada paquete con el desglose numerado de sus sesiones */}
      {(patient.packages ?? []).length > 0 && (
        <CollapsibleSection
          title={t.record.packages.title}
          summary={`${patient.packages.length} ${
            patient.packages.length === 1 ? t.record.packages.packageOne : t.record.packages.packageMany
          } · ${sessionsLeft} ${
            sessionsLeft === 1 ? t.record.packages.sessionLeftOne : t.record.packages.sessionLeftMany
          }`}
        >
          <ul className="space-y-4">
            {patient.packages.map((p, i) => (
              <PackageCard
                key={p.id}
                pkg={p}
                appointments={patient.appointments}
                canManage={!secretary}
                onChanged={reload}
                // El paquete más reciente arranca abierto; los demás, cerrados.
                defaultOpen={i === 0}
              />
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Appointments */}
      <CollapsibleSection
        title={t.record.appointments.title}
        summary={patient.appointments.length === 0 ? t.record.appointments.noneYet : String(patient.appointments.length)}
      >
        {patient.appointments.length === 0 ? (
          <p className="text-sm text-gray-500">{t.record.appointments.empty}</p>
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
                      {a.package && (
                        <span className="ml-2 rounded-full bg-cream-100 text-ink-600 text-[10px] font-medium px-2 py-0.5 align-middle">
                          {t.record.appointments.packageOf} {a.package.totalSessions}
                        </span>
                      )}
                      {a.invoiceStatus === "ISSUED" && (
                        <span className="ml-2 rounded-full bg-brand-100 text-brand-800 text-[10px] font-medium px-2 py-0.5 align-middle">
                          {t.record.appointments.invoiced}
                        </span>
                      )}
                      {a.invoiceStatus === "NOT_REQUESTED" && (
                        <span className="ml-2 rounded-full bg-cream-100 text-ink-600 text-[10px] font-medium px-2 py-0.5 align-middle">
                          {t.record.appointments.noInvoice}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {a.scheduledAt
                        ? formatDate(a.scheduledAt, t.dateLocale)
                        : t.record.appointments.noTime}
                      {" · "}
                      {a.durationMin} {t.record.appointments.min}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AppointmentStatusPill status={a.status} />
                    {a.status === "CANCELED" && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAppointment(a.id)}
                        disabled={deletingId === a.id}
                        className="text-xs font-medium text-red-700 hover:text-red-800 hover:underline underline-offset-2 disabled:opacity-60"
                      >
                        {deletingId === a.id
                          ? t.record.appointments.deleting
                          : t.record.appointments.delete}
                      </button>
                    )}
                  </div>
                </div>

                {a.payment && (
                  <p className="mt-2 text-xs text-gray-600">
                    {t.record.appointments.payment} {paymentStatusLabel(a.payment.status, t)} ·{" "}
                    {formatCents(a.payment.amountCents, a.payment.currency)}
                    {a.payment.id && !secretary && (
                      <>
                        {" · "}
                        <Link
                          href={`/admin/payments/${a.payment.id}`}
                          className="text-brand-700 hover:underline"
                        >
                          {t.record.appointments.viewPayment}
                        </Link>
                      </>
                    )}
                  </p>
                )}

                {(a.charge || (a.chargeable && a.status !== "CANCELED")) && (
                  <ChargePanel
                    key={a.charge?.id ?? "no-charge"}
                    charge={a.charge ?? null}
                    target={{ appointmentId: a.id }}
                    listPriceCents={a.service.priceCents}
                    currency={a.service.currency}
                    canManage={!secretary}
                    onChanged={reload}
                  />
                )}

                {a.meetingUrl && (
                  <p className="mt-1 text-xs text-gray-600 truncate">
                    {t.record.appointments.meeting}{" "}
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
                    📄 {t.record.appointments.planSent} {a.nutritionPlan.title}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>

      {/* Intake forms */}
      {patient.intakeForms.length > 0 && (
        <CollapsibleSection title={t.record.forms.title} summary={String(patient.intakeForms.length)}>
          <ul className="space-y-4">
            {patient.intakeForms.map((f) => (
              <li
                key={f.id}
                className="rounded-xl border border-gray-100 p-4 text-sm"
              >
                <p className="text-xs text-gray-500">
                  {formatDate(f.submittedAt, t.dateLocale)} · {t.record.forms.service} {f.serviceSlug}
                </p>
                <dl className="mt-2 space-y-2">
                  {f.data.goal && (
                    <BlockField label={t.record.forms.goal} value={f.data.goal} />
                  )}
                  {f.data.conditions && (
                    <BlockField label={t.record.forms.conditions} value={f.data.conditions} />
                  )}
                  {f.data.notes && (
                    <BlockField label={t.record.forms.notes} value={f.data.notes} />
                  )}
                </dl>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Payments */}
      {patient.payments.length > 0 && (
        <CollapsibleSection title={t.record.payments.title} summary={String(patient.payments.length)}>
          <ul className="space-y-2">
            {patient.payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{p.service.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(p.createdAt, t.dateLocale)} ·{" "}
                    {paymentStatusLabel(p.status, t)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {formatCents(p.amountCents, p.currency)}
                  </span>
                  {!secretary && (
                    <Link
                      href={`/admin/payments/${p.id}`}
                      className="text-xs text-brand-700 hover:underline"
                    >
                      {t.record.payments.view}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {!secretary && patient.nutritionPlans.length > 0 && (
        <CollapsibleSection title={t.record.plans.title} summary={String(patient.nutritionPlans.length)}>
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
                      ? `${t.record.plans.sent} ${formatDate(np.sentAt, t.dateLocale)}`
                      : t.record.plans.pending}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}
    </SectionsProvider>
  );
}

/**
 * Paquete de sesiones como tarjeta desplegable: el encabezado resume uso y
 * cobro; al abrirlo baja el desglose numerado de sesiones y el cobro.
 */
function PackageCard({
  pkg: p,
  appointments,
  canManage,
  onChanged,
  defaultOpen,
}: {
  pkg: PatientDetail["packages"][number];
  appointments: PatientDetail["appointments"];
  canManage: boolean;
  onChanged: () => void;
  defaultOpen: boolean;
}) {
  const t = useAdminT();
  const [open, setOpen] = useState(defaultOpen);

  // Citas de este paquete que cuentan (no canceladas), en orden
  // cronologico; la posicion es el numero de sesion.
  const sessions = appointments
    .filter((a) => a.package?.id === p.id && a.status !== "CANCELED")
    .sort((a, b) => {
      const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      return ta - tb || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  const canceled = appointments.filter(
    (a) => a.package?.id === p.id && a.status === "CANCELED",
  ).length;
  const panelId = `package-${p.id}`;

  return (
    <li className="rounded-xl border border-gray-100 bg-gray-50/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full text-left flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 rounded-xl hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <span className="min-w-0">
          <span className="block font-medium text-gray-900">{p.serviceName}</span>
          <span className="block text-xs text-gray-500">{t.record.packages.purchased} {formatDate(p.createdAt, t.dateLocale)}</span>
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {/* Resumen del cobro, visible aunque la tarjeta esté cerrada. */}
          {p.charge && (
            <span className="inline-flex items-center gap-1.5">
              <ChargeStatusChip charge={p.charge} />
              {p.charge.balanceCents > 0 && (
                <span className="text-xs font-semibold text-amber-800 tabular-nums">
                  {formatMoney(p.charge.balanceCents, p.charge.currency)}
                </span>
              )}
            </span>
          )}
          <span className="h-2 w-24 sm:w-32 rounded-full bg-gray-200 overflow-hidden">
            <span
              className={`block h-full ${p.remaining === 0 ? "bg-amber-500" : "bg-brand-500"}`}
              style={{ width: `${Math.min(100, (p.usedSessions / p.totalSessions) * 100)}%` }}
            />
          </span>
          <span className={`text-xs font-medium ${p.remaining === 0 ? "text-amber-700" : "text-gray-700"}`}>
            {p.usedSessions}/{p.totalSessions} {t.record.packages.used} ·{" "}
            {p.remaining === 0
              ? t.record.packages.complete
              : `${p.remaining} ${p.remaining === 1 ? t.record.packages.leftOne : t.record.packages.leftMany}`}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-300 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <Collapse open={open}>
        <div id={panelId}>
          <div className="border-t border-gray-100 px-4 py-3 grid sm:grid-cols-2 gap-x-6 gap-y-1">
            {Array.from({ length: p.totalSessions }, (_, i) => i + 1).map((n) => {
              const a = sessions[n - 1];
              const past = isPastIso(a?.scheduledAt ?? null);
              return (
                <div key={n} className="flex items-center gap-3 py-1.5 text-sm border-b border-gray-100 last:border-0">
                  <span className="h-6 w-6 shrink-0 rounded-full bg-white border border-gray-200 text-gray-600 text-[11px] font-semibold flex items-center justify-center">
                    {n}
                  </span>
                  {a ? (
                    <>
                      <span className="text-gray-800 tabular-nums">
                        {a.scheduledAt ? formatDate(a.scheduledAt, t.dateLocale) : t.record.packages.noDate}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {a.modality === "IN_PERSON" ? t.modality.inPerson : t.modality.virtual}
                      </span>
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          a.status === "COMPLETED" || past
                            ? "bg-brand-100 text-brand-800"
                            : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {a.status === "COMPLETED" || past ? t.record.packages.done : appointmentStatusLabel(a.status, t)}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">{t.record.packages.notBooked}</span>
                  )}
                </div>
              );
            })}
          </div>
          {canceled > 0 && (
            <p className="px-4 pb-3 text-[11px] text-gray-500">
              {t.record.packages.canceledNote} {canceled}
            </p>
          )}
          {(p.charge || p.chargeable) && (
            <div className="px-4 pb-3">
              <ChargePanel
                key={p.charge?.id ?? "no-charge"}
                charge={p.charge ?? null}
                target={{ packageId: p.id }}
                listPriceCents={p.listPriceCents}
                currency={p.currency}
                canManage={canManage}
                onChanged={onChanged}
              />
            </div>
          )}
        </div>
      </Collapse>
    </li>
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
  const t = useAdminT();
  const label = appointmentStatusLabel(status, t);
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

/** Estados de cita: mismas etiquetas que la agenda (t.citas.status). */
function appointmentStatusLabel(status: string, t: AdminDict): string {
  return (t.citas.status as Record<string, string>)[status] ?? status;
}

function paymentStatusLabel(status: string, t: AdminDict): string {
  return (t.record.payments.status as Record<string, string>)[status] ?? status;
}

/** Fuera del componente: la regla de pureza de hooks no permite Date.now() en render. */
function isPastIso(iso: string | null): boolean {
  return !!iso && new Date(iso).getTime() < Date.now();
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
