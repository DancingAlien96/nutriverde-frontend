"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell";
import {
  createBlock,
  createSlot,
  deleteBlock,
  deleteSlot,
  listAvailability,
  updateSchedulingSettings,
  updateSlot,
  type AvailabilityBlock,
  type AvailabilitySlot,
  type SchedulingSettings,
} from "../../lib/admin";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
// Mostrar de Lunes a Domingo
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function AvailabilityPage() {
  return (
    <AdminShell>
      <Content />
    </AdminShell>
  );
}

function Content() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [settings, setSettings] = useState<SchedulingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setError(null);
    try {
      const data = await listAvailability();
      setSlots(data.slots);
      setBlocks(data.blocks);
      setSettings(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Cargando…</div>;

  return (
    <>
      <div className="mb-6">
        <h1 className="font-serif-display text-2xl sm:text-3xl text-gray-900">Disponibilidad</h1>
        <p className="text-sm text-gray-600 mt-1">
          Define tu horario semanal y bloquea fechas específicas (vacaciones,
          feriados). Los pacientes solo verán horarios dentro de estos rangos.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {settings && (
        <SettingsSection
          settings={settings}
          onSave={async (patch) => {
            const { settings: updated } = await updateSchedulingSettings(patch);
            setSettings(updated);
          }}
        />
      )}

      <section className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-6 mb-6">
        <h2 className="font-semibold text-gray-900">Horario semanal</h2>
        <p className="text-xs text-gray-500 mt-1">
          Puedes agregar varios rangos por día (por ejemplo 8-12 y 14-17).
        </p>

        <div className="mt-6 space-y-3">
          {DAY_ORDER.map((dow) => (
            <DayRow
              key={dow}
              dayOfWeek={dow}
              slots={slots.filter((s) => s.dayOfWeek === dow)}
              onAdd={async (startMinute, endMinute) => {
                await createSlot({ dayOfWeek: dow, startMinute, endMinute });
                await reload();
              }}
              onToggle={async (id, active) => {
                await updateSlot(id, { active });
                await reload();
              }}
              onDelete={async (id) => {
                await deleteSlot(id);
                await reload();
              }}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-6">
        <h2 className="font-semibold text-gray-900">Bloqueos puntuales</h2>
        <p className="text-xs text-gray-500 mt-1">
          Vacaciones, feriados, días sin disponibilidad. Se aplican sobre el
          horario semanal.
        </p>

        <BlockForm
          onCreate={async (input) => {
            await createBlock(input);
            await reload();
          }}
        />

        {blocks.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No hay bloqueos activos.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {blocks.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5"
              >
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {fmtBlockRange(b.startsAt, b.endsAt)}
                  </p>
                  {b.reason && (
                    <p className="text-xs text-gray-600 mt-0.5">{b.reason}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("¿Eliminar este bloqueo?")) return;
                    try {
                      await deleteBlock(b.id);
                      await reload();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Error");
                    }
                  }}
                  className="text-xs text-red-700 hover:text-red-800 font-medium"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function SettingsSection({
  settings,
  onSave,
}: {
  settings: SchedulingSettings;
  onSave: (patch: Partial<SchedulingSettings>) => Promise<void>;
}) {
  const [allowSameDay, setAllowSameDay] = useState(settings.allowSameDayBooking);
  const [minLead, setMinLead] = useState(settings.minLeadMinutes.toString());
  const [saving, setSaving] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    allowSameDay !== settings.allowSameDayBooking ||
    Number(minLead) !== settings.minLeadMinutes;

  async function handleSave() {
    setError(null);
    setSavedFlag(false);
    const minutes = Number(minLead);
    if (Number.isNaN(minutes) || minutes < 0) {
      setError("Anticipación inválida.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        allowSameDayBooking: allowSameDay,
        minLeadMinutes: minutes,
      });
      setSavedFlag(true);
      setTimeout(() => setSavedFlag(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-6 mb-6">
      <h2 className="font-semibold text-gray-900">Configuración</h2>
      <p className="text-xs text-gray-500 mt-1">
        Reglas que se aplican al calendario que ve el paciente.
      </p>

      <div className="mt-4 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allowSameDay}
            onChange={(e) => setAllowSameDay(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            <span className="block text-sm font-medium text-gray-900">
              Permitir reservas para el mismo día
            </span>
            <span className="block text-xs text-gray-500 mt-0.5">
              Si lo desactivas, el día de hoy aparece como "lleno" sin importar
              los horarios libres.
            </span>
          </span>
        </label>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Anticipación mínima
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="15"
              min="0"
              value={minLead}
              onChange={(e) => setMinLead(e.target.value)}
              disabled={!allowSameDay}
              className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
            />
            <span className="text-sm text-gray-600">minutos</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            El paciente no puede reservar slots que empiecen antes de este
            margen desde ahora. Por ejemplo, 60 = al menos 1 hora antes.
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-700">{error}</p>
      )}

      <div className="mt-5 flex items-center justify-end gap-3">
        {savedFlag && (
          <span className="text-xs text-brand-700 inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Guardado
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 px-5 py-2 text-sm font-medium text-white"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </section>
  );
}

function DayRow({
  dayOfWeek,
  slots,
  onAdd,
  onToggle,
  onDelete,
}: {
  dayOfWeek: number;
  slots: AvailabilitySlot[];
  onAdd: (startMinute: number, endMinute: number) => Promise<void>;
  onToggle: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("17:00");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    setSubmitting(true);
    try {
      await onAdd(toMin(start), toMin(end));
      setAdding(false);
      setStart("08:00");
      setEnd("17:00");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-900">{DAY_NAMES[dayOfWeek]}</p>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-xs text-brand-700 hover:text-brand-800 font-medium"
          >
            + Agregar rango
          </button>
        )}
      </div>

      {slots.length === 0 && !adding && (
        <p className="text-xs text-gray-500">Sin rangos. No habrá citas este día.</p>
      )}

      {slots.length > 0 && (
        <ul className="space-y-1.5">
          {slots.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 text-sm"
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${s.active ? "bg-brand-500" : "bg-gray-300"}`}
              />
              <span className="font-medium text-gray-900">
                {fmtMin(s.startMinute)} – {fmtMin(s.endMinute)}
              </span>
              <button
                type="button"
                onClick={() => onToggle(s.id, !s.active)}
                className="ml-auto text-xs text-gray-600 hover:text-gray-900"
              >
                {s.active ? "Pausar" : "Activar"}
              </button>
              <button
                type="button"
                onClick={() => onDelete(s.id)}
                className="text-xs text-red-700 hover:text-red-800"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-xs">
            Desde
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="block rounded-lg border border-gray-300 px-2 py-1 text-sm w-28"
            />
          </label>
          <label className="text-xs">
            Hasta
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="block rounded-lg border border-gray-300 px-2 py-1 text-sm w-28"
            />
          </label>
          <button
            type="button"
            onClick={handleAdd}
            disabled={submitting}
            className="rounded-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 px-4 py-1.5 text-xs font-medium text-white"
          >
            {submitting ? "Agregando…" : "Agregar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setAdding(false);
              setError(null);
            }}
            className="text-xs text-gray-600 hover:text-gray-900"
          >
            Cancelar
          </button>
          {error && (
            <p className="w-full text-xs text-red-700">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

function BlockForm({
  onCreate,
}: {
  onCreate: (input: {
    startsAt: string;
    endsAt: string;
    reason?: string;
  }) => Promise<void>;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setError(null);
    if (!start || !end) {
      setError("Indica fecha y hora de inicio y fin.");
      return;
    }
    setSubmitting(true);
    try {
      // datetime-local devuelve "YYYY-MM-DDTHH:MM" sin TZ.
      // Lo interpretamos como hora GT (UTC-6) y convertimos a UTC.
      const startsAt = gtLocalToUtcIso(start);
      const endsAt = gtLocalToUtcIso(end);
      await onCreate({
        startsAt,
        endsAt,
        reason: reason.trim() || undefined,
      });
      setStart("");
      setEnd("");
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 grid sm:grid-cols-2 gap-3 items-end">
      <label className="text-xs">
        Desde (hora Guatemala)
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs">
        Hasta (hora Guatemala)
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs sm:col-span-2">
        Razón (opcional)
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej. Vacaciones, viaje, capacitación…"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handle}
          disabled={submitting}
          className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-5 py-2 text-sm font-medium text-white"
        >
          {submitting ? "Agregando…" : "Agregar bloqueo"}
        </button>
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
    </div>
  );
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function fmtMin(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

function fmtBlockRange(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: "America/Guatemala",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return `${s.toLocaleString("es-GT", opts)} → ${e.toLocaleString("es-GT", opts)} (GT)`;
}

/** Recibe "YYYY-MM-DDTHH:MM" como hora GT (UTC-6) y devuelve ISO UTC. */
function gtLocalToUtcIso(local: string): string {
  const [datePart, timePart] = local.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);
  // GT 00:00 = UTC 06:00. Sumamos 6h.
  const utc = new Date(Date.UTC(y, m - 1, d, h + 6, mi));
  return utc.toISOString();
}
