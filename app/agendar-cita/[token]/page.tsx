"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  confirmSlot,
  fetchScheduleInfo,
  fetchSlots,
  fetchTokenAvailability,
  type ScheduleInfo,
} from "../../lib/schedule";
import { MonthCalendar } from "../../components/MonthCalendar";

const BUSINESS_TZ = "America/Guatemala";

export default function SchedulePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [info, setInfo] = useState<ScheduleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const patientTimezone = useMemo(
    () =>
      info?.patient.timezone ??
      (typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "America/Guatemala"),
    [info],
  );

  const fetchAvailability = useCallback(
    (month: string) => fetchTokenAvailability(token, month),
    [token],
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    fetchScheduleInfo(token)
      .then((data) => {
        if (cancelled) return;
        setInfo(data);
        // Si ya está agendada, mostramos la confirmación
        if (data.appointment.scheduledAt && data.appointment.status === "SCHEDULED") {
          setConfirmed(data.appointment.scheduledAt);
        } else if (data.candidateDates.length > 0) {
          setSelectedDate(data.candidateDates[0]);
        }
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
  }, [token]);

  useEffect(() => {
    if (!token || !selectedDate) return;
    let cancelled = false;
    setSlotsLoading(true);
    setSlots(null);
    fetchSlots(token, selectedDate)
      .then((data) => {
        if (!cancelled) {
          setSlots(data.slots);
          setSlotsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setSlotsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, selectedDate]);

  async function handleConfirm() {
    if (!pickedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await confirmSlot(token, pickedSlot);
      setConfirmed(result.appointment.scheduledAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-sm text-gray-500">Cargando…</p>
      </Layout>
    );
  }

  if (error && !info) {
    return (
      <Layout>
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
          <h1 className="font-serif-display text-2xl text-red-800">
            Link no válido
          </h1>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <p className="mt-4 text-xs text-gray-600">
            Si crees que es un error, escríbenos a{" "}
            <a href="mailto:hola@nutriverde.com" className="underline">
              hola@nutriverde.com
            </a>
            .
          </p>
        </div>
      </Layout>
    );
  }

  if (!info) return null;

  if (confirmed) {
    return (
      <Layout>
        <ConfirmedView info={info} confirmedAt={confirmed} patientTimezone={patientTimezone} />
      </Layout>
    );
  }

  if (info.appointment.status === "AWAITING_PAYMENT") {
    return (
      <Layout>
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center">
          <h1 className="font-serif-display text-2xl text-amber-900">
            Tu pago aún no ha sido aprobado
          </h1>
          <p className="mt-2 text-sm text-amber-800">
            Cuando confirmemos tu comprobante te enviaremos un correo y podrás
            elegir tu horario.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="text-center mb-6 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          Tu consulta
        </p>
        <h1 className="font-serif-display mt-3 text-3xl sm:text-4xl text-gray-900">
          Elige el día y hora
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          {info.service.name} · {info.appointment.durationMin} min · {info.patient.fullName}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 max-w-md mx-auto">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 text-center">
          Día (hora Guatemala)
        </h2>
        <MonthCalendar
          fetchAvailability={fetchAvailability}
          selectedDate={selectedDate}
          onSelect={(d) => {
            setSelectedDate(d);
            setPickedSlot(null);
          }}
        />
      </div>

      {selectedDate && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Horario disponible · {fmtSelectedDate(selectedDate)}
          </h2>

          {slotsLoading ? (
            <p className="text-sm text-gray-500">Buscando horarios…</p>
          ) : !slots || slots.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay horarios disponibles ese día. Elige otra fecha.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {slots.map((iso) => {
                const isPicked = iso === pickedSlot;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setPickedSlot(iso)}
                    className={`rounded-xl border px-3 py-2.5 text-sm transition-colors text-center ${
                      isPicked
                        ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600/20"
                        : "border-gray-200 hover:border-brand-300"
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {fmtTime(iso, BUSINESS_TZ)}
                    </div>
                    {patientTimezone !== BUSINESS_TZ && (
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {fmtTime(iso, patientTimezone)} tu hora
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {pickedSlot && (
        <div className="mt-8 bg-white rounded-2xl border border-brand-200 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
            Confirmar cita
          </p>
          <p className="text-lg font-medium text-gray-900">
            {fmtFullDate(pickedSlot, BUSINESS_TZ)}{" "}
            <span className="text-sm font-normal text-gray-500">(Guatemala)</span>
          </p>
          {patientTimezone !== BUSINESS_TZ && (
            <p className="text-sm text-gray-600 mt-0.5">
              {fmtFullDate(pickedSlot, patientTimezone)}{" "}
              <span className="text-gray-500">(tu hora)</span>
            </p>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-6 py-3 text-sm font-medium text-white transition-colors"
          >
            {submitting ? "Confirmando…" : "Confirmar cita"}
          </button>
        </div>
      )}
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-cream-50">
      <header className="bg-white border-b border-cream-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between">
          <Link href="/" className="font-serif-display text-xl sm:text-2xl text-gray-900">
            NutriVerde
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">{children}</div>
    </main>
  );
}

function ConfirmedView({
  info,
  confirmedAt,
  patientTimezone,
}: {
  info: ScheduleInfo;
  confirmedAt: string;
  patientTimezone: string;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-brand-200 p-8 sm:p-12 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-700">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="mt-6 font-serif-display text-3xl text-gray-900">
        ¡Tu cita está confirmada!
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        {info.service.name} · {info.appointment.durationMin} min
      </p>

      <div className="mt-8 inline-block text-left bg-cream-100 border border-cream-300 rounded-2xl px-6 py-4">
        <p className="text-xs uppercase tracking-wider text-brand-700 font-semibold mb-1">
          Fecha y hora
        </p>
        <p className="font-medium text-gray-900">
          {fmtFullDate(confirmedAt, BUSINESS_TZ)}{" "}
          <span className="text-sm font-normal text-gray-500">(Guatemala)</span>
        </p>
        {patientTimezone !== BUSINESS_TZ && (
          <p className="text-sm text-gray-600 mt-1">
            {fmtFullDate(confirmedAt, patientTimezone)}{" "}
            <span className="text-gray-500">(tu hora)</span>
          </p>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-600 max-w-md mx-auto">
        Recibirás un correo con el enlace de la videollamada antes de tu cita.
        Si necesitas reprogramar, responde al correo de confirmación.
      </p>
    </div>
  );
}

function fmtSelectedDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0));
  return date.toLocaleDateString("es-GT", {
    timeZone: BUSINESS_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function fmtTime(iso: string, tz: string): string {
  return new Date(iso).toLocaleTimeString("es-GT", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function fmtFullDate(iso: string, tz: string): string {
  return new Date(iso).toLocaleString("es-GT", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
