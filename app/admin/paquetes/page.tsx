"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "../AdminShell";
import { listPackages, type PackageOverview, type PackagesSummary } from "../../lib/admin";
import { useAdminT } from "../../lib/admin-i18n";
import { ChevronRightIcon } from "../icons";

type Filter = "all" | "active" | "exhausted" | "completed";

export default function PaquetesPage() {
  return (
    <AdminShell>
      <PaquetesContent />
    </AdminShell>
  );
}

/**
 * Vista global de paquetes: cada paciente con su programa, sesiones
 * usadas / restantes y el detalle de cada cita. Es la respuesta a "quiero
 * ver desglosado que citas faltan de cada paquete".
 */
function PaquetesContent() {
  const t = useAdminT();
  const [items, setItems] = useState<PackageOverview[]>([]);
  const [summary, setSummary] = useState<PackagesSummary | null>(null);
  const [filter, setFilter] = useState<Filter>("active");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPackages()
      .then((d) => {
        if (cancelled) return;
        setItems(d.packages);
        setSummary(d.summary);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t.common.error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t.common.error]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      if (filter !== "all" && p.state !== filter) return false;
      if (!q) return true;
      return (
        p.patient.fullName.toLowerCase().includes(q) ||
        p.patient.email.toLowerCase().includes(q) ||
        p.service.name.toLowerCase().includes(q)
      );
    });
  }, [items, filter, query]);

  const tp = t.packagesPage;

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-ink-900">{tp.title}</h1>
          <p className="text-sm text-ink-600 mt-1">{tp.subtitle}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <Stat label={tp.statActive} value={summary.active} tone="brand" />
          <Stat label={tp.statRemaining} value={summary.sessionsRemaining} tone="plain" />
          <Stat label={tp.statExhausted} value={summary.exhausted} tone={summary.exhausted > 0 ? "amber" : "plain"} />
          <Stat label={tp.statCompleted} value={summary.completed} tone="plain" />
        </div>
      )}

      {/* Una sola fila de filtros, arriba de la lista */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="inline-flex rounded-full bg-white border border-cream-200 p-1 text-xs font-medium">
          {(["active", "exhausted", "completed", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 transition-colors ${
                filter === f ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-cream-50"
              }`}
            >
              {tp.filters[f]}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tp.searchPh}
          className="sm:ml-auto w-full sm:w-72 rounded-full border border-cream-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {loading ? (
        <p className="text-sm text-ink-500">{t.common.loading}</p>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl bg-white border border-cream-200 p-10 text-center text-sm text-ink-500">
          {tp.empty}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((p) => (
            <li key={p.id} className="rounded-2xl bg-white border border-cream-200">
              <button
                type="button"
                onClick={() => setOpenId(openId === p.id ? null : p.id)}
                className="w-full text-left px-4 sm:px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5"
              >
                <div className="min-w-0 lg:w-64">
                  <p className="font-medium text-ink-900 truncate">{p.patient.fullName}</p>
                  <p className="text-xs text-ink-500 truncate">
                    {p.patient.email}
                    {p.patient.phone ? ` · ${p.patient.phone}` : ""}
                  </p>
                </div>
                <div className="min-w-0 lg:w-56">
                  <p className="text-sm text-ink-800 truncate">
                    {p.service.name}
                    {p.service.internal && (
                      <span className="ml-1.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-medium px-1.5 py-0.5 align-middle">
                        {tp.internal}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink-500">
                    {tp.bought} {fmtDate(p.createdAt, t.dateLocale)}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-cream-100 overflow-hidden flex gap-[2px]">
                      {/* Realizadas (verde), agendadas por realizar (azul), restantes (vacío) */}
                      {p.doneSessions > 0 && (
                        <div style={{ width: `${(p.doneSessions / p.totalSessions) * 100}%` }} className="bg-brand-500 h-full" />
                      )}
                      {p.scheduledPending > 0 && (
                        <div style={{ width: `${(p.scheduledPending / p.totalSessions) * 100}%` }} className="bg-sky-500 h-full" />
                      )}
                    </div>
                    <span className="text-xs text-ink-700 tabular-nums whitespace-nowrap">
                      {p.usedSessions}/{p.totalSessions}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-500">
                    {p.doneSessions} {tp.done} · {p.scheduledPending} {tp.scheduled} ·{" "}
                    <span className={p.remaining === 0 ? "text-amber-700 font-medium" : "text-ink-700 font-medium"}>
                      {p.remaining} {tp.remaining}
                    </span>
                  </p>
                </div>
                <div className="lg:w-44 text-xs text-ink-600">
                  {p.nextSessionAt ? (
                    <>
                      <span className="block text-[10px] uppercase tracking-wider text-ink-400">{tp.next}</span>
                      {fmtDateTime(p.nextSessionAt, t.dateLocale)}
                    </>
                  ) : p.remaining > 0 ? (
                    <span className="text-amber-700">{tp.noneScheduled}</span>
                  ) : (
                    <span className="text-ink-400">{tp.noNext}</span>
                  )}
                </div>
                <span
                  className={`shrink-0 self-start lg:self-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    p.state === "active"
                      ? "bg-brand-100 text-brand-800"
                      : p.state === "exhausted"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-cream-100 text-ink-600"
                  }`}
                >
                  {tp.states[p.state]}
                </span>
                <ChevronRightIcon
                  className={`hidden lg:block h-4 w-4 text-ink-400 shrink-0 transition-transform ${openId === p.id ? "rotate-90" : ""}`}
                />
              </button>

              {openId === p.id && (
                <div className="border-t border-cream-100 px-4 sm:px-5 py-4">
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                    {Array.from({ length: p.totalSessions }, (_, i) => i + 1).map((n) => {
                      const s = p.sessions.find((x) => x.sessionNumber === n);
                      return (
                        <div key={n} className="flex items-center gap-3 py-1.5 text-sm border-b border-cream-100 last:border-0 sm:[&:nth-last-child(2)]:border-0">
                          <span className="h-6 w-6 shrink-0 rounded-full bg-cream-100 text-ink-600 text-[11px] font-semibold flex items-center justify-center">
                            {n}
                          </span>
                          {s ? (
                            <>
                              <span className="text-ink-800 tabular-nums">
                                {s.scheduledAt ? fmtDateTime(s.scheduledAt, t.dateLocale) : tp.noDate}
                              </span>
                              <span className="text-[11px] text-ink-500">
                                {s.modality === "IN_PERSON" ? t.modality.inPerson : t.modality.virtual}
                              </span>
                              <span
                                className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  s.status === "COMPLETED" || (s.scheduledAt && new Date(s.scheduledAt) < new Date())
                                    ? "bg-brand-100 text-brand-800"
                                    : "bg-sky-100 text-sky-800"
                                }`}
                              >
                                {t.citas.status[s.status as keyof typeof t.citas.status] ?? s.status}
                              </span>
                            </>
                          ) : (
                            <span className="text-ink-400 italic">{tp.notBooked}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {p.sessions.some((s) => s.status === "CANCELED") && (
                    <p className="mt-3 text-[11px] text-ink-500">
                      {tp.canceledNote} {p.sessions.filter((s) => s.status === "CANCELED").length}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs">
                    <Link href={`/admin/patients/${p.patient.id}`} className="font-medium text-brand-700 hover:text-brand-800">
                      {tp.viewPatient}
                    </Link>
                    <Link href="/admin/citas" className="font-medium text-brand-700 hover:text-brand-800">
                      {tp.goCalendar}
                    </Link>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "brand" | "amber" | "plain" }) {
  const cls =
    tone === "brand"
      ? "bg-brand-600 border-brand-600 text-white"
      : tone === "amber"
        ? "bg-amber-50 border-amber-200 text-amber-900"
        : "bg-white border-cream-200 text-ink-900";
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <p className={`text-[11px] uppercase tracking-wider ${tone === "brand" ? "text-white/80" : "text-ink-500"}`}>{label}</p>
      <p className="mt-1 font-sans text-2xl font-semibold">{value}</p>
    </div>
  );
}

function fmtDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    timeZone: "America/Guatemala",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
