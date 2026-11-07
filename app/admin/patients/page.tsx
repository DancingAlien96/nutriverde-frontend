"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "../AdminShell";
import {
  adminMe,
  deletePatient,
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
  | "lastMeasurementAt"
  | "createdAt";

const PAGE_SIZE = 25;

const COLUMNS: { key: SortKey; label: string; align?: "right" | "center"; hide?: string }[] = [
  { key: "fullName", label: "Name" },
  { key: "appointments", label: "Appts", align: "center" },
  { key: "sessionsRemaining", label: "Package" },
  { key: "lastAppointmentAt", label: "Last appointment", hide: "hidden md:table-cell" },
  { key: "lastMeasurementAt", label: "Last measurement", hide: "hidden lg:table-cell" },
  { key: "createdAt", label: "Registered", hide: "hidden xl:table-cell" },
];

/**
 * Lista de pacientes como tabla densa (ordenable, paginada), con acceso al
 * expediente por el icono de ojo y eliminación solo para la nutricionista.
 */
function Content() {
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
      .then((me) => setCanDelete(me.admin.role === "NUTRITIONIST"))
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
          if (!cancelled) setError(err instanceof Error ? err.message : "Error");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250); // debounce de la búsqueda
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, reloadKey]);

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
          <h1 className="font-serif-display text-2xl sm:text-3xl text-gray-900">Patients</h1>
          <p className="text-sm text-gray-600 mt-1">
            {patients.length} {patients.length === 1 ? "patient" : "patients"}. Click a column to sort;
            use the eye to open the record. Search also works by ID or phone.
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
            placeholder="Search name, email, ID or phone…"
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
        <div className="text-sm text-gray-500">Loading…</div>
      ) : patients.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center text-sm text-gray-500">
          {query ? "No matching patients." : "No patients yet."}
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
                        {c.label}
                        <span className="text-[9px] leading-none text-gray-400">
                          {sortKey === c.key ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right font-medium sticky right-0 bg-gray-50">Actions</th>
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
                        <div className="font-medium text-gray-900 whitespace-nowrap">{p.fullName}</div>
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
                                  {k.remaining === 0 ? "none left" : `${k.remaining} left`}
                                </span>
                              </div>
                            ))}
                            {p.packages.length > 2 && (
                              <div className="text-[10px] text-gray-400">+{p.packages.length - 2} more</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap hidden md:table-cell">
                        {p.lastAppointmentAt ? formatDate(p.lastAppointmentAt) : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap hidden lg:table-cell">
                        {p.lastMeasurementAt ? formatDate(p.lastMeasurementAt) : "—"}
                        {p.lastWeightKg != null && (
                          <span className="ml-1 text-gray-400">· {p.lastWeightKg} kg</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap hidden xl:table-cell">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-3 py-2.5 sticky right-0 bg-white group-hover:bg-cream-50">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/patients/${p.id}`)}
                            title="View record"
                            aria-label={`View ${p.fullName}`}
                            className="h-8 w-8 rounded-full text-brand-700 hover:bg-brand-50 flex items-center justify-center"
                          >
                            <EyeIcon />
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setToDelete(p)}
                              title="Delete patient"
                              aria-label={`Delete ${p.fullName}`}
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
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)} of {sorted.length}
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
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const match = typed.trim().toLowerCase() === patient.fullName.trim().toLowerCase();

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await deletePatient(patient.id);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Delete patient</h2>
        <p className="mt-2 text-sm text-gray-600">
          This permanently removes <strong>{patient.fullName}</strong> together with their{" "}
          {patient._count.appointments} appointment{patient._count.appointments === 1 ? "" : "s"},{" "}
          {patient._count.payments} payment{patient._count.payments === 1 ? "" : "s"}, packages, measurements and
          plans. It cannot be undone.
        </p>
        <label className="mt-4 block text-xs text-gray-600">
          Type the patient&apos;s full name to confirm
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
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!match || busy}
            className="rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-40 px-4 py-2 text-sm font-medium text-white"
          >
            {busy ? "Deleting…" : "Delete permanently"}
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}
