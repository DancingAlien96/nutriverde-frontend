"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "../AdminShell";
import { useAdminT } from "../../lib/admin-i18n";
import {
  adminMe,
  deletePatient,
  formatMoney,
  listPatients,
  type PatientListItem,
} from "../../lib/admin";

export default function PatientsPage() {
  return (
    <AdminShell>
      <Content />
    </AdminShell>
  );
}

type SortKey =
  | "fullName"
  | "appointments"
  | "sessionsRemaining"
  | "lastAppointmentAt"
  | "createdAt";

const PAGE_SIZE = 25;

// Las etiquetas salen del diccionario (t.patientsList.columns[key]) dentro del componente.
const COLUMNS: { key: SortKey; align?: "right" | "center"; hide?: string }[] = [
  { key: "fullName" },
  { key: "appointments", align: "center" },
  { key: "sessionsRemaining" },
  { key: "lastAppointmentAt", hide: "hidden md:table-cell" },
  { key: "createdAt", hide: "hidden lg:table-cell" },
];

/**
 * Lista de pacientes como tabla densa (ordenable, paginada), con acceso al
 * expediente por el icono de ojo y eliminación solo para la nutricionista.
 */
function Content() {
  const t = useAdminT();
  const tp = t.patientsList;
  const router = useRouter();
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [canDelete, setCanDelete] = useState(false);
  const [toDelete, setToDelete] = useState<PatientListItem | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    adminMe()
      .then((me) => setCanDelete(me.admin.role === "NUTRITIONIST" || me.admin.role === "SECRETARY"))
      .catch(() => setCanDelete(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      listPatients(query.trim() || undefined)
        .then(({ patients: p }) => {
          if (!cancelled) {
            setPatients(p);
            setError(null);
          }
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof Error ? err.message : t.common.error);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250); // debounce de la búsqueda
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, reloadKey, t.common.error]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const val = (p: PatientListItem): string | number | null => {
      switch (sortKey) {
        case "appointments":
          return p._count.appointments;
        case "sessionsRemaining":
          return p.packages.length ? p.sessionsRemaining : null;
        default:
          return p[sortKey] as string | number | null;
      }
    };
    return [...patients].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1; // vacíos al final, en cualquier sentido
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb), undefined, { sensitivity: "base" }) * dir;
    });
  }, [patients, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "fullName" ? "asc" : "desc");
    }
    setPage(1);
  }

  return (
    <>
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-gray-900">{tp.title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {patients.length} {patients.length === 1 ? tp.countOne : tp.countMany}. {tp.subtitle}
          </p>
        </div>
        <div className="sm:max-w-xs sm:w-72">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={tp.searchPh}
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">{t.common.loading}</div>
      ) : patients.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center text-sm text-gray-500">
          {query ? tp.emptySearch : tp.empty}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                <tr>
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      className={`px-3 py-2.5 font-medium whitespace-nowrap ${c.hide ?? ""} ${
                        c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className={`inline-flex items-center gap-1 hover:text-gray-900 ${
                          sortKey === c.key ? "text-gray-900" : ""
                        }`}
                      >
                        {tp.columns[c.key]}
                        <span className="text-[9px] leading-none text-gray-400">
                          {sortKey === c.key ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right font-medium sticky right-0 bg-gray-50">{tp.actions}</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {rows.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      className="group border-t border-gray-100 hover:bg-cream-50/60 cursor-pointer"
                      onClick={() => router.push(`/admin/patients/${p.id}`)}
                    >
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-gray-900 whitespace-nowrap">
                          {p.fullName}
                          {p.balanceCents > 0 && (
                            <span className="ml-2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-medium px-1.5 py-0.5 align-middle">
                              {tp.owes} {formatMoney(p.balanceCents, "GTQ")}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate max-w-[180px]">{p.email}</div>
                      </td>
                      <td className="px-3 py-2.5 text-center text-gray-700">{p._count.appointments}</td>
                      <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                        {p.packages.length === 0 ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <div className="space-y-0.5">
                            {p.packages.slice(0, 2).map((k) => (
                              <div key={k.id} className="flex items-center gap-1.5">
                                <span className="text-gray-500 truncate max-w-[200px]">{k.serviceName}</span>
                                <span className="font-medium text-gray-800 tabular-nums">
                                  {k.usedSessions}/{k.totalSessions}
                                </span>
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                    k.remaining === 0 ? "bg-amber-100 text-amber-800" : "bg-brand-100 text-brand-800"
                                  }`}
                                >
                                  {k.remaining === 0
                                    ? tp.noneLeft
                                    : k.remaining === 1
                                      ? tp.leftOne
                                      : `${k.remaining} ${tp.leftMany}`}
                                </span>
                              </div>
                            ))}
                            {p.packages.length > 2 && (
                              <div className="text-[10px] text-gray-400">
                                +{p.packages.length - 2} {tp.more}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap hidden md:table-cell">
                        {p.lastAppointmentAt ? formatDate(p.lastAppointmentAt, t.dateLocale) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap hidden lg:table-cell">
                        {formatDate(p.createdAt, t.dateLocale)}
                      </td>
                      <td className="px-3 py-2.5 sticky right-0 bg-white group-hover:bg-cream-50">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/patients/${p.id}`)}
                            title={tp.viewRecord}
                            aria-label={`${tp.view} ${p.fullName}`}
                            className="h-8 w-8 rounded-full text-brand-700 hover:bg-brand-50 flex items-center justify-center"
                          >
                            <EyeIcon />
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setToDelete(p)}
                              title={tp.deletePatient}
                              aria-label={`${tp.delete} ${p.fullName}`}
                              className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50 flex items-center justify-center"
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-3 py-2.5 text-xs text-gray-600">
            <span>
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)} {tp.pageOf}{" "}
              {sorted.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                className="h-7 w-7 rounded-full border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                ‹
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === pageCount || Math.abs(n - safePage) <= 2)
                .map((n, i, arr) => (
                  <span key={n} className="flex items-center">
                    {i > 0 && arr[i - 1] !== n - 1 && <span className="px-1 text-gray-400">…</span>}
                    <button
                      type="button"
                      onClick={() => setPage(n)}
                      className={`h-7 min-w-7 px-2 rounded-full ${
                        n === safePage ? "bg-brand-600 text-white" : "hover:bg-gray-50"
                      }`}
                    >
                      {n}
                    </button>
                  </span>
                ))}
              <button
                type="button"
                disabled={safePage >= pageCount}
                onClick={() => setPage(safePage + 1)}
                className="h-7 w-7 rounded-full border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      {toDelete && (
        <DeleteDialog
          patient={toDelete}
          onCancel={() => setToDelete(null)}
          onDeleted={() => {
            setToDelete(null);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
}

/**
 * Confirmación de borrado: exige escribir el nombre, porque se lleva citas,
 * pagos, paquetes y todo el historial clínico de la paciente.
 */
function DeleteDialog({
  patient,
  onCancel,
  onDeleted,
}: {
  patient: PatientListItem;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const t = useAdminT();
  const d = t.patientsList.dialog;
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const match = typed.trim().toLowerCase() === patient.fullName.trim().toLowerCase();
  const appts = patient._count.appointments;
  const payments = patient._count.payments;

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await deletePatient(patient.id);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">{d.title}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {d.intro} <strong>{patient.fullName}</strong> {d.with} {appts}{" "}
          {appts === 1 ? d.apptOne : d.apptMany}, {payments} {payments === 1 ? d.paymentOne : d.paymentMany},{" "}
          {d.tail}
        </p>
        <label className="mt-4 block text-xs text-gray-600">
          {d.confirmLabel}
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={patient.fullName}
            autoFocus
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </label>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!match || busy}
            className="rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 px-4 py-2 text-sm font-medium text-white"
          >
            {busy ? d.deleting : d.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v7M14 10v7" />
    </svg>
  );
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" });
}
