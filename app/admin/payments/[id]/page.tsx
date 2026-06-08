"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "../../AdminShell";
import {
  approvePayment,
  confirmAppointment,
  fetchReceipt,
  formatCents,
  getPayment,
  rejectPayment,
  setMeetingUrl,
  type IntakeData,
  type PaymentDetail,
} from "../../../lib/admin";

const FRONTEND_ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "";

export default function PaymentDetailPage() {
  return (
    <AdminShell>
      <PaymentDetailContent />
    </AdminShell>
  );
}

function PaymentDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [receipt, setReceipt] = useState<{ blobUrl: string; mime: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [meetingDraft, setMeetingDraft] = useState("");
  const [meetingSaving, setMeetingSaving] = useState(false);
  const [meetingError, setMeetingError] = useState<string | null>(null);
  const [meetingSaved, setMeetingSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function refetch() {
    if (!id) return;
    const { payment: p } = await getPayment(id);
    setPayment(p);
    setMeetingDraft(p.appointment?.meetingUrl ?? "");
  }

  async function handleConfirmAppointment() {
    if (!payment) return;
    const url = meetingDraft.trim();
    if (!url) {
      setMeetingError("El link de la videollamada es obligatorio para confirmar.");
      return;
    }
    setMeetingError(null);
    setConfirming(true);
    try {
      await confirmAppointment(payment.id, { meetingUrl: url });
      await refetch();
    } catch (err) {
      setMeetingError(err instanceof Error ? err.message : "Error");
    } finally {
      setConfirming(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    let blobUrlToRevoke: string | null = null;

    setLoading(true);
    getPayment(id)
      .then(async ({ payment: p, intake: i }) => {
        if (cancelled) return;
        setPayment(p);
        setIntake(i);
        setMeetingDraft(p.appointment?.meetingUrl ?? "");
        try {
          const r = await fetchReceipt(id);
          if (!cancelled) {
            setReceipt(r);
            blobUrlToRevoke = r.blobUrl;
          } else {
            URL.revokeObjectURL(r.blobUrl);
          }
        } catch {
          // No bloqueamos por el comprobante, lo mostramos como link
        }
        if (!cancelled) setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (blobUrlToRevoke) URL.revokeObjectURL(blobUrlToRevoke);
    };
  }, [id]);

  async function handleApprove() {
    if (!payment) return;
    if (!confirm("¿Aprobar este pago? Se enviará un correo al paciente.")) return;
    setActionError(null);
    setSubmitting(true);
    try {
      const { payment: updated } = await approvePayment(payment.id);
      setPayment({ ...payment, ...updated });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveMeeting() {
    if (!payment) return;
    setMeetingError(null);
    setMeetingSaved(false);
    setMeetingSaving(true);
    try {
      const { appointment } = await setMeetingUrl(payment.id, meetingDraft.trim());
      setPayment({
        ...payment,
        appointment: payment.appointment
          ? {
              ...payment.appointment,
              meetingUrl: appointment.meetingUrl,
              meetingProvider: appointment.meetingProvider,
            }
          : null,
      });
      setMeetingSaved(true);
    } catch (err) {
      setMeetingError(err instanceof Error ? err.message : "Error");
    } finally {
      setMeetingSaving(false);
    }
  }

  async function handleReject() {
    if (!payment) return;
    if (rejectReason.trim().length < 3) {
      setActionError("La razón debe tener al menos 3 caracteres.");
      return;
    }
    setActionError(null);
    setSubmitting(true);
    try {
      const { payment: updated } = await rejectPayment(payment.id, rejectReason.trim());
      setPayment({ ...payment, ...updated });
      setShowRejectForm(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Cargando…</div>;
  if (error)
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  if (!payment) return null;

  // Estado de cada paso del proceso (no depende solo del enum status: el paso 3
  // se activa en cuanto hay un horario propuesto y el pago está aprobado).
  const hasTime = !!payment.appointment?.scheduledAt;
  const isScheduled = payment.appointment?.status === "SCHEDULED";

  const step1State: StepState =
    payment.status === "PENDING_REVIEW"
      ? "current"
      : payment.status === "REJECTED"
        ? "rejected"
        : "done";

  const step2State: StepState =
    payment.status !== "APPROVED" ? "upcoming" : hasTime ? "done" : "current";

  const step3State: StepState = isScheduled
    ? "done"
    : payment.status === "APPROVED" && hasTime
      ? "current"
      : "upcoming";

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al listado
        </button>

        <StatusPill status={payment.status} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3">
          {actionError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          <div className="rounded-2xl bg-white border border-gray-200 p-5 sm:p-6">
            {/* ===== PASO 1: Revisar y aprobar el pago ===== */}
            <VerticalStep number={1} title="Revisar y aprobar el pago" state={step1State}>
              <div className="mt-3">
                <ReceiptViewer payment={payment} receipt={receipt} />
              </div>

              {payment.status === "PENDING_REVIEW" && (
                <div className="mt-4">
                  {!showRejectForm ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={submitting}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-5 py-3 text-sm font-medium text-white transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Aprobar pago
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(true)}
                        disabled={submitting}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60 px-5 py-3 text-sm font-medium transition-colors"
                      >
                        Rechazar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-900">
                        Razón del rechazo
                      </label>
                      <textarea
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ej. El monto del comprobante no coincide con el servicio…"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setShowRejectForm(false);
                            setRejectReason("");
                            setActionError(null);
                          }}
                          disabled={submitting}
                          className="text-sm text-gray-600 hover:text-gray-900 px-3"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={submitting || rejectReason.trim().length < 3}
                          className="rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white"
                        >
                          {submitting ? "Enviando…" : "Confirmar rechazo"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {payment.status === "APPROVED" && (
                <p className="mt-3 text-xs text-brand-700 inline-flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Pago aprobado{payment.approvedAt ? ` · ${formatDate(payment.approvedAt)}` : ""}
                </p>
              )}

              {payment.status === "REJECTED" && payment.rejectedReason && (
                <p className="mt-3 text-sm text-red-700">
                  <strong>Rechazado:</strong> {payment.rejectedReason}
                </p>
              )}
            </VerticalStep>

            {/* ===== PASO 2: Horario del paciente ===== */}
            {payment.status !== "REJECTED" && payment.appointment && (
              <VerticalStep number={2} title="Horario de la consulta" state={step2State}>
                {hasTime ? (
                  <p className="mt-2 text-sm text-gray-900">
                    <span className="text-gray-500">Horario propuesto: </span>
                    {formatDate(payment.appointment.scheduledAt!)}
                  </p>
                ) : step2State === "current" ? (
                  <>
                    <p className="mt-2 text-sm text-gray-600">
                      Esperando a que el paciente elija un horario. Comparte este
                      link si lo necesita:
                    </p>
                    {payment.appointment.scheduleToken && (
                      <div className="mt-2">
                        <ScheduleLinkRow
                          url={`${FRONTEND_ORIGIN}/agendar-cita/${payment.appointment.scheduleToken}`}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">
                    Disponible cuando se apruebe el pago.
                  </p>
                )}
              </VerticalStep>
            )}

            {/* ===== PASO 3: Confirmar cita + enviar link ===== */}
            {payment.status !== "REJECTED" && payment.appointment && (
              <VerticalStep
                number={3}
                title="Confirmar cita y enviar link"
                state={step3State}
                isLast
              >
                {step3State === "current" && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Pega el link de la videollamada para confirmar la cita. El
                      paciente recibirá un correo con la fecha y el enlace.
                    </p>
                    <label className="block text-xs text-gray-600 mt-3 mb-1.5">
                      Link de la videollamada (Meet / Zoom) *
                    </label>
                    <input
                      type="url"
                      value={meetingDraft}
                      onChange={(e) => {
                        setMeetingDraft(e.target.value);
                        setMeetingError(null);
                      }}
                      placeholder="https://meet.google.com/..."
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {meetingError && (
                      <p className="mt-2 text-xs text-red-600">{meetingError}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleConfirmAppointment}
                      disabled={confirming || !meetingDraft.trim()}
                      className="mt-3 w-full rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 px-4 py-2.5 text-sm font-medium text-white"
                    >
                      {confirming ? "Confirmando…" : "Confirmar cita y enviar link"}
                    </button>
                  </div>
                )}

                {step3State === "done" && (
                  <div className="mt-2">
                    <p className="text-sm text-brand-700 inline-flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Cita confirmada y link enviado.
                    </p>
                    <label className="block text-xs text-gray-500 mt-3 mb-1.5">
                      Link de la videollamada (puedes actualizarlo)
                    </label>
                    <input
                      type="url"
                      value={meetingDraft}
                      onChange={(e) => {
                        setMeetingDraft(e.target.value);
                        setMeetingSaved(false);
                        setMeetingError(null);
                      }}
                      placeholder="https://meet.google.com/..."
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {meetingError && (
                      <p className="mt-2 text-xs text-red-600">{meetingError}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {meetingSaved ? (
                        <span className="text-xs text-brand-700 inline-flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Guardado
                        </span>
                      ) : (
                        <span />
                      )}
                      <button
                        type="button"
                        onClick={handleSaveMeeting}
                        disabled={
                          meetingSaving ||
                          meetingDraft.trim() ===
                            (payment.appointment.meetingUrl ?? "")
                        }
                        className="rounded-full bg-gray-900 hover:bg-gray-800 disabled:opacity-40 px-4 py-1.5 text-xs font-medium text-white"
                      >
                        {meetingSaving ? "Guardando…" : "Actualizar link"}
                      </button>
                    </div>
                  </div>
                )}

                {step3State === "upcoming" && (
                  <p className="mt-2 text-sm text-gray-500">
                    Disponible cuando el paciente elija su horario.
                  </p>
                )}
              </VerticalStep>
            )}
          </div>
        </section>

        <aside className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white border border-gray-200 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Resumen
            </h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Row label="Servicio" value={payment.service.name} />
              <Row
                label="Monto"
                value={formatCents(payment.amountCents, payment.currency)}
                strong
              />
              <Row label="Recibido" value={formatDate(payment.createdAt)} />
              {payment.appointment && (
                <Row
                  label="Cita"
                  value={appointmentStatusLabel(payment.appointment.status)}
                />
              )}
            </dl>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Paciente
            </h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Row label="Nombre" value={payment.patient.fullName} strong />
              <Row label="Correo" value={payment.patient.email} />
              {payment.patient.phone && (
                <Row label="Teléfono" value={payment.patient.phone} />
              )}
              <Row label="Zona horaria" value={payment.patient.timezone} />
              <Row
                label="WhatsApp"
                value={payment.patient.whatsappNotify ? "Sí" : "No"}
              />
            </dl>
          </div>

          {intake && (
            <div className="rounded-2xl bg-white border border-gray-200 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Formulario
              </h3>
              <dl className="mt-3 space-y-3 text-sm">
                {intake.data.goal && (
                  <BlockRow label="Objetivo" value={intake.data.goal} />
                )}
                {intake.data.conditions && (
                  <BlockRow label="Condiciones" value={intake.data.conditions} />
                )}
                {intake.data.notes && (
                  <BlockRow label="Notas" value={intake.data.notes} />
                )}
              </dl>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

type StepState = "done" | "current" | "upcoming" | "rejected";

function VerticalStep({
  number,
  title,
  state,
  isLast,
  children,
}: {
  number: number;
  title: string;
  state: StepState;
  isLast?: boolean;
  children: React.ReactNode;
}) {
  const badge =
    state === "done"
      ? "bg-brand-600 text-white"
      : state === "current"
        ? "bg-brand-600 text-white ring-4 ring-brand-100"
        : state === "rejected"
          ? "bg-red-500 text-white"
          : "bg-gray-100 text-gray-400 border border-gray-200";

  // La línea conectora se tiñe de verde si el paso ya está completado/rechazado.
  const lineColor =
    state === "done" || state === "rejected" ? "bg-brand-300" : "bg-gray-200";

  return (
    <div className="flex gap-4">
      {/* Columna izquierda: círculo + línea vertical conectora */}
      <div className="flex flex-col items-center">
        <span
          className={`h-8 w-8 shrink-0 rounded-full text-xs font-semibold flex items-center justify-center ${badge}`}
        >
          {state === "done" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : state === "rejected" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            number
          )}
        </span>
        {!isLast && <span className={`w-px flex-1 my-1 ${lineColor}`} />}
      </div>

      {/* Columna derecha: título + contenido */}
      <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-8"}`}>
        <h2
          className={`font-semibold pt-1 ${
            state === "upcoming" ? "text-gray-400" : "text-gray-900"
          }`}
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

function ReceiptViewer({
  payment,
  receipt,
}: {
  payment: PaymentDetail;
  receipt: { blobUrl: string; mime: string } | null;
}) {
  if (!receipt) {
    return (
      <p className="mt-3 text-sm text-gray-500">
        No se pudo cargar el comprobante.
      </p>
    );
  }

  const isImage = receipt.mime.startsWith("image/");
  const isPdf = receipt.mime === "application/pdf";

  return (
    <div className="mt-3">
      {isImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={receipt.blobUrl}
          alt="Comprobante"
          className="w-full rounded-xl border border-gray-200 max-h-[400px] sm:max-h-[600px] object-contain bg-gray-50"
        />
      )}
      {isPdf && (
        <iframe
          src={receipt.blobUrl}
          title="Comprobante PDF"
          className="w-full h-[400px] sm:h-[600px] rounded-xl border border-gray-200"
        />
      )}
      {!isImage && !isPdf && (
        <p className="text-sm text-gray-500">Tipo de archivo: {receipt.mime}</p>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>Tipo: {payment.receiptMime ?? receipt.mime}</span>
        <a
          href={receipt.blobUrl}
          download={`comprobante-${payment.id}${getExtFromMime(receipt.mime)}`}
          className="text-brand-700 hover:text-brand-800 font-medium"
        >
          Descargar
        </a>
      </div>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
}) {
  const label =
    status === "PENDING_REVIEW"
      ? "Pendiente"
      : status === "APPROVED"
        ? "Aprobado"
        : "Rechazado";
  const cls =
    status === "APPROVED"
      ? "bg-brand-100 text-brand-800 border-brand-200"
      : status === "REJECTED"
        ? "bg-red-100 text-red-800 border-red-200"
        : "bg-amber-100 text-amber-800 border-amber-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className={`text-sm text-right ${strong ? "font-semibold text-gray-900" : "text-gray-800"}`}>
        {value}
      </dd>
    </div>
  );
}

function BlockRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-800 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function appointmentStatusLabel(status: string): string {
  switch (status) {
    case "AWAITING_PAYMENT":
      return "Esperando pago";
    case "PAYMENT_APPROVED":
      return "Pendiente de horario";
    case "PENDING_CONFIRMATION":
      return "Por confirmar";
    case "SCHEDULED":
      return "Agendada";
    case "COMPLETED":
      return "Realizada";
    case "CANCELED":
      return "Cancelada";
    case "NO_SHOW":
      return "No asistió";
    default:
      return status;
  }
}

function ScheduleLinkRow({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop — navegadores muy viejos
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={url}
        readOnly
        onFocus={(e) => e.currentTarget.select()}
        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 font-mono"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-full border border-gray-200 hover:border-brand-300 px-3 py-2 text-xs font-medium text-gray-700"
      >
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-GT", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getExtFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/heic": ".heic",
    "application/pdf": ".pdf",
  };
  return map[mime] ?? "";
}