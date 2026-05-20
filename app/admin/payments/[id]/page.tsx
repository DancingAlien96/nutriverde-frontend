"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "../../AdminShell";
import {
  approvePayment,
  fetchReceipt,
  formatCents,
  getPayment,
  rejectPayment,
  type IntakeData,
  type PaymentDetail,
} from "../../../lib/admin";

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

  const canAct = payment.status === "PENDING_REVIEW";

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
        <section className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl bg-white border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900">Comprobante</h2>
            <ReceiptViewer payment={payment} receipt={receipt} />
          </div>

          {actionError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {canAct && (
            <div className="rounded-2xl bg-white border border-gray-200 p-5">
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

          {payment.status === "REJECTED" && payment.rejectedReason && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm">
              <p className="font-medium text-red-800">Pago rechazado</p>
              <p className="mt-1 text-red-700">{payment.rejectedReason}</p>
            </div>
          )}
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
              {payment.approvedAt && (
                <Row label="Aprobado" value={formatDate(payment.approvedAt)} />
              )}
              {payment.approvedBy && (
                <Row label="Aprobado por" value={payment.approvedBy.fullName} />
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
          className="w-full rounded-xl border border-gray-200 max-h-[600px] object-contain bg-gray-50"
        />
      )}
      {isPdf && (
        <iframe
          src={receipt.blobUrl}
          title="Comprobante PDF"
          className="w-full h-[600px] rounded-xl border border-gray-200"
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