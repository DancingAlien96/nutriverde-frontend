"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "../AdminShell";
import {
  listPayments,
  formatCents,
  getPaymentSettings,
  updatePaymentSettings,
  type PaymentListItem,
  type PaymentSettings,
} from "../../lib/admin";

type StatusFilter = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

const STATUS_LABEL: Record<StatusFilter, string> = {
  PENDING_REVIEW: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<StatusFilter, string> = {
  PENDING_REVIEW: "bg-amber-100 text-amber-800 border-amber-200",
  APPROVED: "bg-brand-100 text-brand-800 border-brand-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

export default function PagosPage() {
  return (
    <AdminShell>
      <PagosContent />
    </AdminShell>
  );
}

function PagosContent() {
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
          <h1 className="font-serif-display text-2xl sm:text-3xl text-ink-900">Payments</h1>
          <p className="text-sm text-ink-600 mt-1">
            Review the receipts and approve or reject each one.
          </p>
        </div>

        <div className="inline-flex rounded-full bg-white border border-cream-200 p-1 text-xs font-medium self-start sm:self-auto">
          {(Object.keys(STATUS_LABEL) as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                status === s
                  ? "bg-brand-400 text-white"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <BankSettings />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-ink-500">Loading…</div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl bg-white border border-cream-200 p-10 text-center text-sm text-ink-500">
          No payments with status <strong>{STATUS_LABEL[status]}</strong>.
        </div>
      ) : (
        <>
          {/* Móvil: tarjetas */}
          <ul className="space-y-3 sm:hidden">
            {payments.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/payments/${p.id}`}
                  className="block rounded-2xl border border-cream-200 bg-white p-4 active:bg-cream-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-ink-900 truncate">
                        {p.patient.fullName}
                      </p>
                      <p className="text-xs text-ink-500 truncate">
                        {p.patient.email}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-ink-700 truncate">
                        {p.service.name}
                      </p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {formatDate(p.createdAt)}
                      </p>
                    </div>
                    <p className="font-semibold text-ink-900 shrink-0">
                      {formatCents(p.amountCents, p.currency)}
                    </p>
                  </div>
                  <p className="mt-3 text-xs font-medium text-brand-700">
                    Review →
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Tablet/desktop: tabla */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-cream-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Patient</th>
                  <th className="text-left px-4 py-3 font-medium">Service</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                    Received
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-cream-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-900">
                        {p.patient.fullName}
                      </div>
                      <div className="text-xs text-ink-500">
                        {p.patient.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{p.service.name}</td>
                    <td className="px-4 py-3 text-right font-medium text-ink-900">
                      {formatCents(p.amountCents, p.currency)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-ink-500 text-xs">
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
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
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

/**
 * Datos bancarios que ve la paciente al subir su comprobante.
 * Antes estaban escritos a mano en el frontend, asi que cambiarlos exigia
 * redesplegar; ahora viven en la BD y se editan aqui.
 */
function BankSettings() {
  const [form, setForm] = useState<PaymentSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPaymentSettings()
      .then(({ settings }) => {
        if (!cancelled) setForm(settings);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function field(key: keyof PaymentSettings, value: string) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setMsg(null);
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      const { settings } = await updatePaymentSettings(form);
      setForm(settings);
      setMsg("Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  const incomplete = form && !(form.bankName && form.accountNumber);

  return (
    <section className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-6 mb-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <span>
          <span className="font-semibold text-gray-900">Bank account</span>
          <span className="block text-xs text-gray-500 mt-1">
            Shown to patients on the booking form when they upload their receipt.
          </span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {incomplete && (
            <span className="text-[11px] font-medium rounded-full bg-amber-100 text-amber-800 px-2 py-1">
              Not configured
            </span>
          )}
          <span className="text-gray-400 text-sm">{open ? "−" : "+"}</span>
        </span>
      </button>

      {open && (
        <div className="mt-5">
          {!form && !error && (
            <p className="text-sm text-gray-500">Loading…</p>
          )}

          {form && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Bank"
                  value={form.bankName}
                  placeholder="Banrural"
                  onChange={(v) => field("bankName", v)}
                />
                <Field
                  label="Account type"
                  value={form.accountType}
                  placeholder="Monetaria"
                  onChange={(v) => field("accountType", v)}
                />
                <Field
                  label="Account number"
                  value={form.accountNumber}
                  placeholder="3-456-78901-2"
                  onChange={(v) => field("accountNumber", v)}
                />
                <Field
                  label="Account holder"
                  value={form.accountHolder}
                  placeholder="Dulce Menzel"
                  onChange={(v) => field("accountHolder", v)}
                />
              </div>

              <label className="block mt-4">
                <span className="text-xs font-medium text-gray-700">
                  Extra instructions (optional)
                </span>
                <textarea
                  value={form.instructions ?? ""}
                  onChange={(e) => field("instructions", e.target.value)}
                  rows={2}
                  placeholder="SWIFT code for international transfers, crediting times, etc."
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </label>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="rounded-full bg-brand-600 text-white text-sm font-medium px-5 py-2 hover:bg-brand-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                {msg && <span className="text-sm text-brand-700">{msg}</span>}
                {error && <span className="text-sm text-red-600">{error}</span>}
              </div>
            </>
          )}

          {error && !form && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </label>
  );
}
