"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell } from "./AdminShell";
import { adminMe, formatCents, getDashboard, type DashboardData } from "../lib/admin";
import { useAdminT, type AdminDict } from "../lib/admin-i18n";
import { CalendarIcon, CardIcon, ChevronRightIcon, ClockIcon, UsersIcon } from "./icons";
import { Reminders } from "./Reminders";

/*
 * Paleta de las gráficas (validada con el método de dataviz sobre tarjetas
 * blancas): serie 1 verde, serie 2 azul. Pasan banda de luminosidad, croma,
 * separación para daltonismo y contraste >= 3:1. Los estados de pago usan la
 * escala de estado fija (bueno / aviso / crítico) siempre con icono + texto.
 */
const SERIES_1 = "#5f8f2e";
const SERIES_2 = "#2a78d6";
const STATUS_GOOD = "#0ca30c";
const STATUS_WARN = "#fab219";
const STATUS_CRIT = "#d03b3b";
const GRID = "#e8e4d8";
const AXIS = "#c9c4b5";
const MUTED = "#8a8578";

export default function InicioPage() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}

function DashboardContent() {
  const t = useAdminT();
  const [range, setRange] = useState<6 | 12>(12);
  const [data, setData] = useState<DashboardData | null>(null);
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminMe()
      .then((me) => setFirstName(me.admin.fullName?.trim().split(/\s+/)[0] ?? ""))
      .catch(() => {});
  }, []);

  // Al cambiar el rango se conserva la gráfica anterior atenuada hasta que
  // llegan los datos nuevos (sin parpadeo ni salto de layout).
  useEffect(() => {
    let cancelled = false;
    getDashboard(range)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
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
  }, [range, t.common.error]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-ink-900">
            {t.dashboard.welcome}, {firstName || "Dulce"} <span aria-hidden>🌿</span>
          </h1>
          <p className="text-sm text-ink-500 mt-1">{t.dashboard.subtitle}</p>
        </div>
        <span className="self-start sm:self-auto rounded-full bg-white border border-cream-200 px-4 h-10 flex items-center text-sm text-ink-700 font-medium">
          {new Date().toLocaleDateString(t.dateLocale, { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {loading || !data ? (
        <div className="text-sm text-ink-500">{t.common.loading}</div>
      ) : (
        <div className="space-y-5">
          {/* KPIs */}
          <KpiRow data={data} t={t} />

          {/* Fila de filtros: un solo control, arriba de todo lo que afecta */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-full bg-white border border-cream-200 p-1 text-xs font-medium">
              {([6, 12] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setRange(m)}
                  className={`rounded-full px-3.5 py-1.5 transition-colors ${
                    range === m ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-cream-50"
                  }`}
                >
                  {m === 6 ? t.dashboard.range6 : t.dashboard.range12}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <IncomeByMonth data={data} t={t} />
            </div>
            <PaymentsThisMonth data={data} t={t} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AppointmentsByMonth data={data} t={t} />
            <RevenueByService data={data} t={t} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard title={t.dashboard.upcomingTitle} footer={{ href: "/admin/citas", label: t.dashboard.viewCalendar }}>
              {data.upcoming.length === 0 ? (
                <EmptyHint>{t.dashboard.noUpcoming}</EmptyHint>
              ) : (
                <ul className="space-y-1">
                  {data.upcoming.map((u) => (
                    <li key={u.id} className="flex items-center gap-3 py-2 border-b border-cream-100 last:border-0">
                      <Avatar name={u.patient.fullName} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink-900 truncate">{u.patient.fullName}</p>
                        <p className="text-xs text-ink-500 truncate">{u.service.name}</p>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 text-xs text-ink-500 tabular-nums">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {fmtShort(u.scheduledAt, t.dateLocale)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard title={t.dashboard.recentPatients} footer={{ href: "/admin/patients", label: t.dashboard.viewPatients }}>
              {data.recentPatients.length === 0 ? (
                <EmptyHint>{t.dashboard.noPatients}</EmptyHint>
              ) : (
                <ul className="space-y-1">
                  {data.recentPatients.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/admin/patients/${p.id}`}
                        className="flex items-center gap-3 py-2 border-b border-cream-100 last:border-0 hover:bg-cream-50 -mx-2 px-2 rounded-lg"
                      >
                        <Avatar name={p.fullName} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink-900 truncate">{p.fullName}</p>
                          <p className="text-xs text-ink-500 truncate">{p.email}</p>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-ink-400 shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <Reminders />
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* KPIs                                                                */
/* ------------------------------------------------------------------ */

function KpiRow({ data, t }: { data: DashboardData; t: AdminDict }) {
  const k = data.kpis;
  const delta =
    k.incomeLastMonthCents > 0
      ? Math.round(((k.incomeThisMonthCents - k.incomeLastMonthCents) / k.incomeLastMonthCents) * 100)
      : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Figura principal del tablero */}
      <div className="rounded-3xl bg-brand-600 border border-brand-600 text-white p-5 flex flex-col">
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
            <CardIcon className="h-5 w-5" />
          </span>
          <span className="text-xs uppercase tracking-wider font-medium text-white/80">{t.dashboard.incomeMonth}</span>
        </div>
        <p className="mt-4 font-sans text-[2.6rem] leading-none font-semibold">
          {formatCents(k.incomeThisMonthCents, "GTQ")}
        </p>
        <p className="mt-2 text-sm text-white/85">
          {delta === null ? (
            t.dashboard.noPrev
          ) : (
            <>
              <span className="font-medium">
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
              </span>{" "}
              {t.dashboard.vsLast}
            </>
          )}
        </p>
        {k.pendingReview > 0 && (
          <Link
            href="/admin/pagos"
            className="mt-3 inline-flex self-start items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs px-2.5 py-1"
          >
            <span aria-hidden>●</span> {k.pendingReview} {t.dashboard.pendingReview}
          </Link>
        )}
      </div>

      <StatTile
        icon={<CalendarIcon className="h-5 w-5" />}
        label={t.dashboard.apptsMonth}
        value={String(k.appointmentsThisMonth)}
        sub={t.dashboard.apptsMonthSub}
        footer={{ href: "/admin/citas", label: t.dashboard.viewCalendar }}
      />
      <StatTile
        icon={<UsersIcon className="h-5 w-5" />}
        label={t.dashboard.patients}
        value={String(k.patientsTotal)}
        sub={`+${k.newPatientsThisMonth} ${t.dashboard.newThisMonth}`}
        footer={{ href: "/admin/patients", label: t.dashboard.viewPatients }}
      />
      <StatTile
        icon={<ClockIcon className="h-5 w-5" />}
        label={t.dashboard.packages}
        value={String(k.activePackages)}
        sub={`${k.sessionsRemaining} ${t.dashboard.sessionsLeft}`}
      />
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  sub,
  footer,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  footer?: { href: string; label: string };
}) {
  return (
    <div className="rounded-3xl bg-white border border-cream-200 p-5 flex flex-col">
      <div className="flex items-center gap-2">
        <span className="h-9 w-9 rounded-full bg-cream-100 text-brand-600 flex items-center justify-center">{icon}</span>
        <span className="text-xs uppercase tracking-wider font-medium text-ink-500">{label}</span>
      </div>
      <p className="mt-4 font-sans text-3xl font-semibold text-ink-900">{value}</p>
      <p className="text-sm mt-1 text-ink-500">{sub}</p>
      {footer && (
        <Link href={footer.href} className="mt-auto pt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800">
          {footer.label}
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gráficas                                                            */
/* ------------------------------------------------------------------ */

/** Tarjeta de gráfica con su vista de tabla (el equivalente accesible). */
function ChartCard({
  title,
  subtitle,
  t,
  table,
  children,
  note,
}: {
  title: string;
  subtitle: string;
  t: AdminDict;
  table: React.ReactNode;
  children: React.ReactNode;
  note?: React.ReactNode;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <div className="rounded-3xl bg-white border border-cream-200 p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-xs uppercase tracking-wider font-semibold text-ink-500">{title}</h2>
          <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="shrink-0 rounded-full border border-cream-200 px-3 py-1 text-[11px] font-medium text-ink-600 hover:bg-cream-50"
        >
          {showTable ? t.dashboard.chart : t.dashboard.table}
        </button>
      </div>
      <div className="flex-1">{showTable ? table : children}</div>
      {note && <div className="mt-2 text-[11px] text-ink-400">{note}</div>}
    </div>
  );
}

function IncomeByMonth({ data, t }: { data: DashboardData; t: AdminDict }) {
  const rows = useMemo(
    () =>
      data.incomeByMonth.map((m) => ({
        key: m.month,
        label: monthLabel(m.month, t.dateLocale),
        gtq: m.gtqCents / 100,
        usd: m.usdCents / 100,
        count: m.count,
      })),
    [data, t.dateLocale],
  );
  const total = rows.reduce((a, r) => a + r.gtq, 0);
  const usdTotal = rows.reduce((a, r) => a + r.usd, 0);
  const maxIdx = rows.reduce((best, r, i) => (r.gtq > rows[best].gtq ? i : best), 0);
  const lastIdx = rows.length - 1;
  // Etiqueta selectiva: solo el mes actual y el máximo llevan su valor encima;
  // el resto lo cuentan el eje y el tooltip.
  const plotted = rows.map((r, i) => ({
    ...r,
    labelValue: (i === lastIdx || i === maxIdx) && r.gtq > 0 ? r.gtq : undefined,
  }));

  const table = (
    <SimpleTable
      head={[t.dashboard.month, t.dashboard.amount, t.dashboard.count]}
      rows={rows.map((r) => [r.label, `Q${fmtNum(r.gtq)}`, String(r.count)])}
    />
  );

  return (
    <ChartCard
      title={t.dashboard.incomeByMonth}
      subtitle={t.dashboard.incomeByMonthSub}
      t={t}
      table={table}
      note={usdTotal > 0 ? `${t.dashboard.usdNote} US$${fmtNum(usdTotal)}` : undefined}
    >
      {total === 0 ? (
        <EmptyHint>{t.dashboard.noData}</EmptyHint>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={plotted} margin={{ top: 18, right: 8, left: 0, bottom: 0 }} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke={GRID} strokeWidth={1} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: MUTED }}
                axisLine={{ stroke: AXIS }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: MUTED }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(v: number) => compactQ(v)}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const r = payload[0].payload as (typeof rows)[number];
                  return (
                    <TipBox title={r.label}>
                      <TipRow color={SERIES_1} value={`Q${fmtNum(r.gtq)}`} label={`${r.count} ${t.dashboard.count.toLowerCase()}`} />
                      {r.usd > 0 && <TipRow color={MUTED} value={`US$${fmtNum(r.usd)}`} label="USD" />}
                    </TipBox>
                  );
                }}
              />
              <Bar dataKey="gtq" fill={SERIES_1} radius={[4, 4, 0, 0]} maxBarSize={24}>
                <LabelList
                  dataKey="labelValue"
                  position="top"
                  formatter={(v: unknown) => (typeof v === "number" ? compactQ(v) : "")}
                  style={{ fontSize: 11, fill: "#2d2a22", fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

function AppointmentsByMonth({ data, t }: { data: DashboardData; t: AdminDict }) {
  const rows = useMemo(
    () =>
      data.appointmentsByMonth.map((m) => ({
        label: monthLabel(m.month, t.dateLocale),
        done: m.done,
        upcoming: m.upcoming,
        canceled: m.canceled,
      })),
    [data, t.dateLocale],
  );
  const total = rows.reduce((a, r) => a + r.done + r.upcoming, 0);

  const table = (
    <SimpleTable
      head={[t.dashboard.month, t.dashboard.done, t.dashboard.upcoming, t.dashboard.canceled]}
      rows={rows.map((r) => [r.label, String(r.done), String(r.upcoming), String(r.canceled)])}
    />
  );

  return (
    <ChartCard title={t.dashboard.apptsByMonth} subtitle={t.dashboard.apptsByMonthSub} t={t} table={table}>
      {total === 0 ? (
        <EmptyHint>{t.dashboard.noData}</EmptyHint>
      ) : (
        <>
          <Legend
            items={[
              { color: SERIES_1, label: t.dashboard.done },
              { color: SERIES_2, label: t.dashboard.upcoming },
            ]}
          />
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="35%">
                <CartesianGrid vertical={false} stroke={GRID} strokeWidth={1} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: MUTED }} axisLine={{ stroke: AXIS }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const r = payload[0].payload as (typeof rows)[number];
                    return (
                      <TipBox title={r.label}>
                        <TipRow color={SERIES_1} value={String(r.done)} label={t.dashboard.done} />
                        <TipRow color={SERIES_2} value={String(r.upcoming)} label={t.dashboard.upcoming} />
                        {r.canceled > 0 && <TipRow color={MUTED} value={String(r.canceled)} label={t.dashboard.canceled} />}
                      </TipBox>
                    );
                  }}
                />
                {/* Hueco de 2px en color de superficie entre segmentos apilados */}
                <Bar dataKey="done" stackId="a" fill={SERIES_1} stroke="#ffffff" strokeWidth={2} maxBarSize={24} />
                <Bar dataKey="upcoming" stackId="a" fill={SERIES_2} stroke="#ffffff" strokeWidth={2} radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </ChartCard>
  );
}

function RevenueByService({ data, t }: { data: DashboardData; t: AdminDict }) {
  const rows = useMemo(
    () =>
      data.revenueByService.map((s) => ({
        name: s.name === "__other__" ? t.dashboard.other : s.name,
        gtq: s.gtqCents / 100,
        count: s.count,
      })),
    [data, t.dashboard.other],
  );

  const table = (
    <SimpleTable
      head={[t.dashboard.service, t.dashboard.amount, t.dashboard.count]}
      rows={rows.map((r) => [r.name, `Q${fmtNum(r.gtq)}`, String(r.count)])}
    />
  );

  return (
    <ChartCard title={t.dashboard.byService} subtitle={t.dashboard.byServiceSub} t={t} table={table}>
      {rows.length === 0 ? (
        <EmptyHint>{t.dashboard.noData}</EmptyHint>
      ) : (
        <div style={{ height: Math.max(140, rows.length * 40 + 16) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 64, left: 4, bottom: 4 }} barCategoryGap="30%">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 12, fill: "#2d2a22" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const r = payload[0].payload as (typeof rows)[number];
                  return (
                    <TipBox title={r.name}>
                      <TipRow color={SERIES_1} value={`Q${fmtNum(r.gtq)}`} label={`${r.count} ${t.dashboard.count.toLowerCase()}`} />
                    </TipBox>
                  );
                }}
              />
              <Bar dataKey="gtq" fill={SERIES_1} radius={[0, 4, 4, 0]} maxBarSize={18}>
                {/* Valor en la punta de cada barra: pocas barras, cabe bien */}
                <LabelList
                  dataKey="gtq"
                  position="right"
                  formatter={(v: unknown) => `Q${fmtNum(Number(v))}`}
                  style={{ fontSize: 11, fill: "#2d2a22", fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

function PaymentsThisMonth({ data, t }: { data: DashboardData; t: AdminDict }) {
  const p = data.paymentsThisMonth;
  const total = p.approved + p.pending + p.rejected;
  const segments = [
    { key: "approved", color: STATUS_GOOD, icon: "✓", label: t.dashboard.approved, count: p.approved, cents: p.approvedCents },
    { key: "pending", color: STATUS_WARN, icon: "●", label: t.dashboard.pending, count: p.pending, cents: p.pendingCents },
    { key: "rejected", color: STATUS_CRIT, icon: "✕", label: t.dashboard.rejected, count: p.rejected, cents: p.rejectedCents },
  ];

  const table = (
    <SimpleTable
      head={["", t.dashboard.count, t.dashboard.amount]}
      rows={segments.map((s) => [s.label, String(s.count), formatCents(s.cents, "GTQ")])}
    />
  );

  return (
    <ChartCard title={t.dashboard.paymentsMonth} subtitle={t.dashboard.paymentsMonthSub} t={t} table={table}>
      {total === 0 ? (
        <EmptyHint>{t.dashboard.noPayments}</EmptyHint>
      ) : (
        <div className="flex flex-col h-full">
          <p className="font-sans text-3xl font-semibold text-ink-900">
            {formatCents(p.approvedCents, "GTQ")}
            <span className="ml-2 text-sm font-normal text-ink-500">{t.dashboard.approved.toLowerCase()}</span>
          </p>
          {/* Barra apilada parte-del-todo, con hueco de 2px entre segmentos */}
          <div className="mt-4 flex h-3 w-full gap-[2px] rounded-full overflow-hidden" role="img" aria-label={t.dashboard.paymentsMonth}>
            {segments
              .filter((s) => s.count > 0)
              .map((s) => (
                <div
                  key={s.key}
                  title={`${s.label}: ${s.count}`}
                  style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }}
                />
              ))}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {segments.map((s) => (
              <li key={s.key} className="flex items-center gap-2">
                <span
                  className="h-5 w-5 rounded-full text-[11px] font-bold flex items-center justify-center text-white"
                  style={{ backgroundColor: s.color, color: s.key === "pending" ? "#0b0b0b" : "#fff" }}
                  aria-hidden
                >
                  {s.icon}
                </span>
                <span className="text-ink-600 flex-1">{s.label}</span>
                <span className="text-ink-900 font-medium tabular-nums">{s.count}</span>
                <span className="text-ink-500 tabular-nums w-20 text-right">{formatCents(s.cents, "GTQ")}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/pagos" className="mt-auto pt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800">
            {t.dashboard.viewPayments}
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/* Piezas                                                              */
/* ------------------------------------------------------------------ */

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map((i) => (
        <li key={i.label} className="inline-flex items-center gap-1.5 text-[11px] text-ink-600">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: i.color }} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

function TipBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white border border-cream-200 shadow-sm px-3 py-2 text-xs">
      <p className="font-medium text-ink-900 mb-1 capitalize">{title}</p>
      {children}
    </div>
  );
}

function TipRow({ color, value, label }: { color: string; value: string; label: string }) {
  return (
    <p className="flex items-center gap-2">
      <span className="inline-block h-0.5 w-3 rounded" style={{ backgroundColor: color }} />
      <span className="font-semibold text-ink-900 tabular-nums">{value}</span>
      <span className="text-ink-500">{label}</span>
    </p>
  );
}

function SimpleTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-ink-500 uppercase tracking-wider text-[10px]">
          <tr>
            {head.map((h, i) => (
              <th key={i} className={`py-1.5 pr-3 font-medium ${i === 0 ? "text-left" : "text-right"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-cream-100">
              {r.map((c, j) => (
                <td key={j} className={`py-1.5 pr-3 ${j === 0 ? "text-left text-ink-800 capitalize" : "text-right text-ink-700"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionCard({
  title,
  footer,
  children,
}: {
  title: string;
  footer?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white border border-cream-200 p-5 flex flex-col">
      <h2 className="text-xs uppercase tracking-wider font-semibold text-ink-500 mb-3">{title}</h2>
      <div className="flex-1">{children}</div>
      {footer && (
        <Link href={footer.href} className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800">
          {footer.label}
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const ini = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  return (
    <span className="h-9 w-9 shrink-0 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
      {ini || "·"}
    </span>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink-400 py-6 text-center">{children}</p>;
}

/* Helpers */
function monthLabel(key: string, locale: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleString(locale, { month: "short", timeZone: "UTC" });
}
function fmtNum(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function compactQ(v: number): string {
  if (v >= 1000) return `Q${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return `Q${Math.round(v)}`;
}
function fmtShort(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}
