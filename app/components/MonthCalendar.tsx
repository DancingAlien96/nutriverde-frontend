"use client";

import { useEffect, useMemo, useState } from "react";
import type { MonthAvailability } from "../lib/api";
import { useT } from "../lib/i18n";

interface Props {
  /** Función que obtiene la disponibilidad de un mes. Permite reutilizar el
   * calendario tanto en /agendar (por slug) como en /agendar-cita (por token). */
  fetchAvailability: (month: string) => Promise<MonthAvailability>;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

function currentMonthGT(): string {
  // Mes actual en GT (UTC-6). Usamos un Date "ahora menos 6h" y leemos UTC.
  const now = new Date(Date.now() - 6 * 60 * 60_000);
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function today(): string {
  const now = new Date(Date.now() - 6 * 60 * 60_000);
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function MonthCalendar({ fetchAvailability, selectedDate, onSelect }: Props) {
  const { calendar } = useT();
  const [month, setMonth] = useState<string>(currentMonthGT());
  const [availability, setAvailability] = useState<MonthAvailability | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAvailability(null);
    fetchAvailability(month)
      .then((data) => {
        if (!cancelled) {
          setAvailability(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, fetchAvailability]);

  const cells = useMemo(() => buildMonthCells(month), [month]);
  const todayStr = today();
  const minMonth = currentMonthGT();

  const [year, monthNum] = month.split("-").map(Number);

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, -1))}
          disabled={month <= minMonth}
          className="h-8 w-8 rounded-full border border-gray-200 hover:border-brand-300 flex items-center justify-center text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={calendar.prevMonth}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <p className="text-sm font-semibold text-gray-900 capitalize">
          {calendar.months[monthNum - 1]} {year}
        </p>

        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          className="h-8 w-8 rounded-full border border-gray-200 hover:border-brand-300 flex items-center justify-center text-gray-700"
          aria-label={calendar.nextMonth}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {calendar.weekdays.map((d, i) => (
          <div key={`${d}-${i}`} className="text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} />;
          }
          const isPast = cell.date < todayStr;
          const isToday = cell.date === todayStr;
          const status = availability?.days?.[cell.date];
          const isWorkingDow = availability?.workingDaysOfWeek.includes(cell.dayOfWeek) ?? true;

          // Reglas: pasado / no laboral / bloqueado / agotado / disponible
          let state:
            | "past"
            | "non-working"
            | "blocked"
            | "full"
            | "available";

          if (isPast) state = "past";
          else if (!isWorkingDow) state = "non-working";
          else if (status === "BLOCKED") state = "blocked";
          else if (status === "FULL") state = "full";
          else if (status === "AVAILABLE") state = "available";
          else state = loading ? "past" : "non-working"; // sin info aún -> visual desactivado

          const isSelected = cell.date === selectedDate;

          const disabled = state !== "available";

          return (
            <button
              key={cell.date}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(cell.date)}
              className={[
                "relative aspect-square rounded-lg text-sm flex flex-col items-center justify-center transition-colors",
                isSelected
                  ? "bg-brand-600 text-white ring-2 ring-brand-700"
                  : state === "available"
                    ? "bg-white border border-gray-200 hover:border-brand-400 text-gray-900"
                    : state === "full"
                      ? "bg-red-50 border border-red-100 text-red-400 line-through cursor-not-allowed"
                      : state === "blocked"
                        ? "bg-amber-50 border border-amber-100 text-amber-500 cursor-not-allowed"
                        : "text-gray-300 cursor-not-allowed",
                isToday && !isSelected ? "ring-1 ring-brand-400" : "",
              ].join(" ")}
              aria-label={`${cell.date} ${state}`}
            >
              <span className="font-medium">{cell.day}</span>
              {state === "full" && (
                <span className="text-[8px] uppercase tracking-wide">{calendar.fullBadge}</span>
              )}
              {state === "blocked" && (
                <span className="text-[8px] uppercase tracking-wide">{calendar.blockedBadge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-gray-200 bg-white" />
          {calendar.available}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-red-100 bg-red-50" />
          {calendar.full}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-amber-100 bg-amber-50" />
          {calendar.blocked}
        </span>
      </div>
    </div>
  );
}

function buildMonthCells(monthStr: string): ({ date: string; day: number; dayOfWeek: number } | null)[] {
  const [year, month] = monthStr.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  // Lunes = 0 en nuestro grid
  const dowMon0 = (firstDay.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: ({ date: string; day: number; dayOfWeek: number } | null)[] = [];
  for (let i = 0; i < dowMon0; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayOfWeek = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
    cells.push({ date: dateStr, day: d, dayOfWeek });
  }
  return cells;
}
