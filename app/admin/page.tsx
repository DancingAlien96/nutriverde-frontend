"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AdminShell } from "./AdminShell";
import {
  listPayments,
  listPatients,
  adminMe,
  formatCents,
  type PaymentListItem,
  type PatientListItem,
} from "../lib/admin";
import {
  BellIcon,
  CalendarIcon,
  CardIcon,
  UsersIcon,
  ClockIcon,
  ChevronRightIcon,
} from "./icons";
import { Reminders } from "./Reminders";

export default function InicioPage() {
  return (
    <AdminShell>
      <InicioContent />
    </AdminShell>
  );
}

function InicioContent() {
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [firstName, setFirstName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listPayments(), listPatients(), adminMe()])
      .then(([pay, pat, me]) => {
        if (cancelled) return;
        setPayments(pay.payments);
        setPatients(pat.patients);
        setFirstName(me.admin.fullName?.trim().split(/\s+/)[0] ?? "");
        setLoading(false);
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
  }, []);

  const m = useMemo(() => computeMetrics(payments, patients), [payments, patients]);

  return (
    <>
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-ink-900">
            Welcome{firstName ? `, ${firstName}` : ""}! <span aria-hidden>🌿</span>
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Here's a summary of your practice.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="h-10 w-10 rounded-full bg-white border border-cream-200 text-ink-500 flex items-center justify-center">
            <BellIcon className="h-5 w-5" />
          </span>
          <span className="h-10 w-10 rounded-full bg-white border border-cream-200 text-ink-500 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <span className="rounded-full bg-white border border-cream-200 px-4 h-10 flex items-center text-sm text-ink-700 font-medium">
            {todayLabel()}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-ink-500">Loading summary…</div>
      ) : (
        <div className="space-y-5">
          {/* Fila de estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatCard
              tone="highlight"
              icon={<CardIcon className="h-5 w-5" />}
              label="Payments received"
              value={formatCents(m.sumThisMonth, "GTQ")}
              sub="Total this month"
              badge={
                m.deltaPct === null
                  ? undefined
                  : `${m.deltaPct >= 0 ? "↑" : "↓"} ${Math.abs(m.deltaPct)}% vs. last month`
              }
            />
            <StatCard
              icon={<CalendarIcon className="h-5 w-5" />}
              label="Appointments today"
              value={String(m.citasHoy)}
              sub="Scheduled"
              footer={{ href: "/admin/citas", label: "View calendar" }}
            />
            <StatCard
              icon={<UsersIcon className="h-5 w-5" />}
              label="Active patients"
              value={String(m.pacientesActivos)}
              sub="In follow-up"
              footer={{ href: "/admin/patients", label: "View patients" }}
            />
            {/* Imagen decorativa */}
            <div className="hidden xl:block relative rounded-3xl overflow-hidden border border-cream-200">
              <Image
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
                alt=""
                fill
                aria-hidden
                className="object-cover"
                sizes="300px"
              />
            </div>
          </div>

          {/* Fila media */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Próximas citas */}
            <SectionCard
              title="Upcoming appointments"
              footer={{ href: "/admin/citas", label: "View full calendar" }}
            >
              {m.upcoming.length === 0 ? (
                <EmptyHint>No upcoming confirmed appointments.</EmptyHint>
              ) : (
                <ul className="space-y-1">
                  {m.upcoming.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center gap-3 py-2 border-b border-cream-100 last:border-0"
                    >
                      <Avatar name={u.patientName} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink-900 truncate">
                          {u.patientName}
                        </p>
                        <p className="text-xs text-ink-500 truncate">
                          {u.serviceName}
                        </p>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 text-xs text-ink-500">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {timeLabel(u.scheduledAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            {/* Resumen de pagos */}
            <SectionCard
              title="Payments summary"
              aside={
                <span className="text-xs text-ink-500 bg-cream-100 rounded-full px-3 py-1">
                  This month
                </span>
              }
              footer={{ href: "/admin/pagos", label: "View all payments" }}
            >
              <PaymentsDonut data={m.donut} total={m.donutTotal} />
            </SectionCard>

            {/* Pacientes recientes */}
            <SectionCard
              title="Recent patients"
              footer={{ href: "/admin/patients", label: "View all patients" }}
            >
              {m.recentPatients.length === 0 ? (
                <EmptyHint>No patients registered yet.</EmptyHint>
              ) : (
                <ul className="space-y-1">
                  {m.recentPatients.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/admin/patients/${p.id}`}
                        className="flex items-center gap-3 py-2 border-b border-cream-100 last:border-0 hover:bg-cream-50 -mx-2 px-2 rounded-lg"
                      >
                        <Avatar name={p.fullName} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink-900 truncate">
                            {p.fullName}
                          </p>
                          <p className="text-xs text-ink-500 truncate">
                            {p.email}
                          </p>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-ink-400 shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          {/* Fila inferior */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Reminders />
            </div>
            {/* Tarjeta motivacional */}
            <div className="relative rounded-3xl overflow-hidden border border-cream-200 min-h-[180px] flex">
              <Image
                src="https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=80"
                alt=""
                fill
                aria-hidden
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 360px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cream-50/95 via-cream-50/70 to-transparent" />
              <div className="relative p-6 flex flex-col justify-center">
                <span className="text-brand-500 text-lg" aria-hidden>
                  🌿
                </span>
                <p className="font-serif-display text-xl text-ink-900 mt-2 leading-snug max-w-[12rem]">
                  Small habits, big changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Métricas                                                            */
/* ------------------------------------------------------------------ */

type UpcomingItem = {
  id: string;
  patientName: string;
  serviceName: string;
  scheduledAt: string;
};

type DonutSlice = { name: string; value: number; color: string };

function computeMetrics(payments: PaymentListItem[], patients: PatientListItem[]) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow0 = new Date(today0);
  tomorrow0.setDate(today0.getDate() + 1);

  const inThisMonth = (iso: string | null) =>
    iso ? new Date(iso) >= monthStart : false;
  const inLastMonth = (iso: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d >= lastMonthStart && d < monthStart;
  };

  let sumThisMonth = 0;
  let sumLastMonth = 0;
  let recibidos = 0;
  let pendientes = 0;
  let rechazados = 0;

  for (const p of payments) {
    if (p.status === "APPROVED" && inThisMonth(p.approvedAt)) {
      sumThisMonth += p.amountCents;
      recibidos += p.amountCents;
    }
    if (p.status === "APPROVED" && inLastMonth(p.approvedAt)) {
      sumLastMonth += p.amountCents;
    }
    if (p.status === "PENDING_REVIEW" && inThisMonth(p.createdAt)) {
      pendientes += p.amountCents;
    }
    if (p.status === "REJECTED" && inThisMonth(p.createdAt)) {
      rechazados += p.amountCents;
    }
  }

  const deltaPct =
    sumLastMonth > 0
      ? Math.round(((sumThisMonth - sumLastMonth) / sumLastMonth) * 100)
      : null;

  const citasHoy = payments.filter((p) => {
    const a = p.appointment;
    if (!a?.scheduledAt) return false;
    const t = new Date(a.scheduledAt);
    return t >= today0 && t < tomorrow0 && a.status !== "CANCELED";
  }).length;

  const upcoming: UpcomingItem[] = payments
    .filter((p) => {
      const a = p.appointment;
      if (!a?.scheduledAt) return false;
      return new Date(a.scheduledAt) >= now && a.status !== "CANCELED";
    })
    .sort(
      (a, b) =>
        new Date(a.appointment!.scheduledAt!).getTime() -
        new Date(b.appointment!.scheduledAt!).getTime(),
    )
    .slice(0, 3)
    .map((p) => ({
      id: p.appointment!.id,
      patientName: p.patient.fullName,
      serviceName: p.service.name,
      scheduledAt: p.appointment!.scheduledAt!,
    }));

  const recentPatients = [...patients]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  const donut: DonutSlice[] = [
    { name: "Received", value: recibidos, color: "#8a9b67" },
    { name: "Pending", value: pendientes, color: "#e3d8bf" },
    { name: "Rejected", value: rechazados, color: "#c27a63" },
  ];
  const donutTotal = recibidos + pendientes + rechazados;

  return {
    sumThisMonth,
    deltaPct,
    citasHoy,
    pacientesActivos: patients.length,
    upcoming,
    recentPatients,
    donut,
    donutTotal,
  };
}

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                     */
/* ------------------------------------------------------------------ */

function StatCard({
  tone = "plain",
  icon,
  label,
  value,
  sub,
  badge,
  footer,
}: {
  tone?: "plain" | "highlight";
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  badge?: string;
  footer?: { href: string; label: string };
}) {
  const highlight = tone === "highlight";
  return (
    <div
      className={`rounded-3xl p-5 flex flex-col border ${
        highlight
          ? "bg-brand-600 border-brand-600 text-white"
          : "bg-white border-cream-200 text-ink-900"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-9 w-9 rounded-full flex items-center justify-center ${
            highlight ? "bg-white/15 text-white" : "bg-cream-100 text-brand-600"
          }`}
        >
          {icon}
        </span>
        <span
          className={`text-xs uppercase tracking-wider font-medium ${
            highlight ? "text-white/80" : "text-ink-500"
          }`}
        >
          {label}
        </span>
      </div>
      <p
        className={`mt-4 font-serif-display text-3xl ${
          highlight ? "text-white" : "text-ink-900"
        }`}
      >
        {value}
      </p>
      <p className={`text-sm mt-1 ${highlight ? "text-white/80" : "text-ink-500"}`}>
        {sub}
      </p>
      {badge && (
        <span className="mt-3 inline-flex self-start items-center rounded-full bg-white/15 text-white text-xs px-2.5 py-1">
          {badge}
        </span>
      )}
      {footer && (
        <Link
          href={footer.href}
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          {footer.label}
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function SectionCard({
  title,
  aside,
  footer,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  footer?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white border border-cream-200 p-5 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-ink-500">
          {title}
        </h2>
        {aside}
      </div>
      <div className="flex-1">{children}</div>
      {footer && (
        <Link
          href={footer.href}
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          {footer.label}
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function PaymentsDonut({ data, total }: { data: DonutSlice[]; total: number }) {
  if (total === 0) {
    return (
      <EmptyHint>No payment activity this month.</EmptyHint>
    );
  }
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[150px] w-[150px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.filter((d) => d.value > 0)}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={2}
              stroke="none"
            >
              {data
                .filter((d) => d.value > 0)
                .map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-serif-display text-lg text-ink-900">
            {formatCents(total, "GTQ")}
          </span>
          <span className="text-[10px] text-ink-500">Total</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm flex-1 min-w-0">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-ink-600 flex-1 truncate">{d.name}</span>
            <span className="text-ink-900 font-medium">
              {formatCents(d.value, "GTQ")}
            </span>
          </li>
        ))}
      </ul>
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
  return (
    <p className="text-sm text-ink-400 py-6 text-center">{children}</p>
  );
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
