"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "../AdminShell";
import {
  DOCUMENT_TYPE_LABEL,
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

function Content() {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(() => {
      listPatients(query.trim() || undefined)
        .then(({ patients: p }) => {
          if (!cancelled) {
            setPatients(p);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Error");
            setLoading(false);
          }
        });
    }, 250); // debounce
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-gray-900">
            Patients
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Search by name, email, ID or phone. Click a patient to view their
            record.
          </p>
        </div>
        <div className="sm:max-w-xs sm:w-72">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
        <>
          {/* Móvil: tarjetas */}
          <ul className="space-y-3 sm:hidden">
            {patients.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/patients/${p.id}`}
                  className="block rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {p.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{p.email}</p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-500">
                      {p._count.appointments}{" "}
                      {p._count.appointments === 1 ? "appt" : "appts"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    <span className="text-gray-700 min-w-0 truncate">
                      {p.documentId ? (
                        <>
                          <span className="uppercase tracking-wider text-gray-500 mr-1.5">
                            {DOCUMENT_TYPE_LABEL[p.documentType]}
                          </span>
                          <span className="font-mono">{p.documentId}</span>
                        </>
                      ) : (
                        "No ID"
                      )}
                    </span>
                    {p.phone && (
                      <span className="text-gray-500 shrink-0">{p.phone}</span>
                    )}
                  </div>
                  <p className="mt-3 text-xs font-medium text-brand-700">View →</p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Tablet/desktop: tabla */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Patient</th>
                  <th className="text-left px-4 py-3 font-medium">ID</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                    Phone
                  </th>
                  <th className="text-center px-4 py-3 font-medium">Appts</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                    Last activity
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {p.fullName}
                      </div>
                      <div className="text-xs text-gray-500">{p.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {p.documentId ? (
                        <>
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 mr-1.5">
                            {DOCUMENT_TYPE_LABEL[p.documentType]}
                          </span>
                          <span className="font-mono">{p.documentId}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-700 text-xs">
                      {p.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {p._count.appointments}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                      {formatDate(p.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/patients/${p.id}`}
                        className="text-xs font-medium text-brand-700 hover:text-brand-800"
                      >
                        View →
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
