"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "./AdminShell";
import {
  listPayments,
  formatCents,
  type PaymentListItem,
} from "../lib/admin";

type StatusFilter = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

const STATUS_LABEL: Record<StatusFilter, string> = {
  PENDING_REVIEW: "Pendientes",
  APPROVED: "Aprobados",
  REJECTED: "Rechazados",
};

const STATUS_COLORS: Record<StatusFilter, string> = {
  PENDING_REVIEW: "bg-amber-100 text-amber-800 border-amber-200",
  APPROVED: "bg-brand-100 text-brand-800 border-brand-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}

function DashboardContent() {
  const [status, setStatus] = useState<StatusFilter>("PENDING_REVIEW");
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listPayments(status)
      .then(({ payments: p }) => {
        if (!cancelled) {
          setPayments(p);
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
  }, [status]);

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-gray-900">Pagos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Revisa los comprobantes y aprueba o rechaza cada uno.
          </p>
        </div>

        <div className="inline-flex rounded-full bg-white border border-gray-200 p-1 text-xs font-medium self-start sm:self-auto">
          {(Object.keys(STATUS_LABEL) as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                status === s
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Cargando…</div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center text-sm text-gray-500">
          No hay pagos en estado <strong>{STATUS_LABEL[status]}</strong>.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Paciente</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                  Servicio
                </th>
                <th className="text-right px-4 py-3 font-medium">Monto</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Recibido
                </th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {p.patient.fullName}
                    </div>
                    <div className="text-xs text-gray-500">{p.patient.email}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-700">
                    {p.service.name}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCents(p.amountCents, p.currency)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/payments/${p.id}`}
                      className="text-xs font-medium text-brand-700 hover:text-brand-800"
                    >
                      Revisar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
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
