"use client";

import { useState } from "react";
import {
  addDiagnosis,
  addMealPlan,
  addMeasurement,
  addTraining,
  deleteDiagnosis,
  deleteMealPlan,
  deleteMeasurement,
  deleteTraining,
  updatePatient,
  type AnthropometricMeasurement,
  type MealPlanRecord,
  type PatientDetail,
  type PatientDiagnosis,
  type PatientTraining,
  type PatientUpdatePatch,
} from "../../../lib/admin";

// ============================================================
// Datos clínicos estáticos
// ============================================================

export function StaticHealthSection({
  patient,
  onSaved,
}: {
  patient: PatientDetail;
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    birthDate: patient.birthDate
      ? patient.birthDate.slice(0, 10)
      : "",
    heightCm: patient.heightCm?.toString() ?? "",
    allergies: patient.allergies ?? "",
    medicalConditions: patient.medicalConditions ?? "",
    medications: patient.medications ?? "",
    alcoholNotes: patient.alcoholNotes ?? "",
    cravingsNotes: patient.cravingsNotes ?? "",
    waterCoffeeNotes: patient.waterCoffeeNotes ?? "",
    dislikedFoods: patient.dislikedFoods ?? "",
    weekendSpots: patient.weekendSpots ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setSubmitting(true);
    try {
      const patch: PatientUpdatePatch = {
        birthDate: form.birthDate
          ? new Date(form.birthDate + "T12:00:00Z").toISOString()
          : null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        allergies: form.allergies.trim() || null,
        medicalConditions: form.medicalConditions.trim() || null,
        medications: form.medications.trim() || null,
        alcoholNotes: form.alcoholNotes.trim() || null,
        cravingsNotes: form.cravingsNotes.trim() || null,
        waterCoffeeNotes: form.waterCoffeeNotes.trim() || null,
        dislikedFoods: form.dislikedFoods.trim() || null,
        weekendSpots: form.weekendSpots.trim() || null,
      };
      await updatePatient(patient.id, patch);
      await onSaved();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title="Datos clínicos">
      {!editing ? (
        <div className="space-y-1.5 text-sm">
          <KV label="Fecha de nacimiento" value={fmtDate(patient.birthDate)} />
          <KV label="Edad" value={ageFrom(patient.birthDate)} />
          <KV
            label="Estatura"
            value={patient.heightCm ? `${(patient.heightCm / 100).toFixed(2)} m` : "—"}
          />
          <KV label="Alergias" value={patient.allergies ?? "—"} block />
          <KV label="Enfermedades" value={patient.medicalConditions ?? "—"} block />
          <KV label="Medicamentos" value={patient.medications ?? "—"} block />
          <KV label="Alcohol" value={patient.alcoholNotes ?? "—"} />
          <KV label="Antojos dulces" value={patient.cravingsNotes ?? "—"} />
          <KV label="Agua / café" value={patient.waterCoffeeNotes ?? "—"} />
          <KV label="Alimentos no gusta" value={patient.dislikedFoods ?? "—"} block />
          <KV
            label="Lugares fin de semana"
            value={patient.weekendSpots ?? "—"}
            block
          />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-3 text-xs font-medium text-brand-700 hover:text-brand-800"
          >
            Editar →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Fecha de nacimiento">
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Estatura (cm)">
              <input
                type="number"
                min={0}
                max={250}
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                placeholder="170"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Alergias / enfermedades alimentarias">
            <textarea
              rows={2}
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Enfermedades">
            <textarea
              rows={2}
              value={form.medicalConditions}
              onChange={(e) =>
                setForm({ ...form, medicalConditions: e.target.value })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Medicamentos / suplementos">
            <textarea
              rows={2}
              value={form.medications}
              onChange={(e) => setForm({ ...form, medications: e.target.value })}
              className={inputClass}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Alcohol">
              <input
                type="text"
                value={form.alcoholNotes}
                onChange={(e) =>
                  setForm({ ...form, alcoholNotes: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Antojos cosas dulces">
              <input
                type="text"
                value={form.cravingsNotes}
                onChange={(e) =>
                  setForm({ ...form, cravingsNotes: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Agua pura / café">
              <input
                type="text"
                value={form.waterCoffeeNotes}
                onChange={(e) =>
                  setForm({ ...form, waterCoffeeNotes: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Alimentos que no le gusta">
              <input
                type="text"
                value={form.dislikedFoods}
                onChange={(e) =>
                  setForm({ ...form, dislikedFoods: e.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Lugares que frecuenta fin de semana">
            <textarea
              rows={2}
              value={form.weekendSpots}
              onChange={(e) => setForm({ ...form, weekendSpots: e.target.value })}
              className={inputClass}
            />
          </Field>

          {error && <p className="text-xs text-red-700">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={submitting}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting}
              className={primaryBtn}
            >
              {submitting ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Diagnóstico
// ============================================================

export function DiagnosesSection({
  patientId,
  diagnoses,
  onChanged,
}: {
  patientId: string;
  diagnoses: PatientDiagnosis[];
  onChanged: () => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    objective: "",
    goalFatPercent: "",
    goalFatLossLbs: "",
    goalLeanMassKg: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    setSubmitting(true);
    try {
      await addDiagnosis(patientId, {
        objective: form.objective.trim() || null,
        goalFatPercent: form.goalFatPercent ? Number(form.goalFatPercent) : null,
        goalFatLossLbs: form.goalFatLossLbs ? Number(form.goalFatLossLbs) : null,
        goalLeanMassKg: form.goalLeanMassKg ? Number(form.goalLeanMassKg) : null,
        notes: form.notes.trim() || null,
      });
      setForm({
        objective: "",
        goalFatPercent: "",
        goalFatLossLbs: "",
        goalLeanMassKg: "",
        notes: "",
      });
      setAdding(false);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta entrada de diagnóstico?")) return;
    try {
      await deleteDiagnosis(patientId, id);
      await onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <Card title="Diagnóstico y metas">
      {diagnoses.length === 0 && !adding && (
        <p className="text-sm text-gray-500">Sin entradas.</p>
      )}

      <ul className="space-y-3">
        {diagnoses.map((d, i) => (
          <li
            key={d.id}
            className={`rounded-xl border p-4 ${
              i === 0 ? "bg-brand-50/40 border-brand-200" : "bg-gray-50 border-gray-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-xs text-gray-500">
                {i === 0 && (
                  <span className="inline-block mr-2 rounded-full bg-brand-600 text-white px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    actual
                  </span>
                )}
                {fmtDateTime(d.createdAt)}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(d.id)}
                className="text-xs text-red-700 hover:text-red-800"
              >
                Eliminar
              </button>
            </div>
            {d.objective && (
              <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                <strong className="text-gray-900">Objetivo:</strong> {d.objective}
              </p>
            )}
            <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
              {d.goalFatPercent != null && (
                <KVSmall label="Meta % grasa" value={`${d.goalFatPercent}%`} />
              )}
              {d.goalFatLossLbs != null && (
                <KVSmall label="Meta lbs grasa" value={`${d.goalFatLossLbs} lb`} />
              )}
              {d.goalLeanMassKg != null && (
                <KVSmall label="Meta masa magra" value={`${d.goalLeanMassKg} kg`} />
              )}
            </dl>
            {d.notes && (
              <p className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                {d.notes}
              </p>
            )}
          </li>
        ))}
      </ul>

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          + Nueva entrada
        </button>
      ) : (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <Field label="Objetivo">
            <textarea
              rows={2}
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              placeholder="Ej. Control de comida y aumentar masa muscular"
              className={inputClass}
            />
          </Field>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Meta % grasa">
              <input
                type="number"
                step="0.1"
                value={form.goalFatPercent}
                onChange={(e) =>
                  setForm({ ...form, goalFatPercent: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Meta lbs grasa">
              <input
                type="number"
                step="0.1"
                value={form.goalFatLossLbs}
                onChange={(e) =>
                  setForm({ ...form, goalFatLossLbs: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Meta masa magra (kg)">
              <input
                type="number"
                step="0.1"
                value={form.goalLeanMassKg}
                onChange={(e) =>
                  setForm({ ...form, goalLeanMassKg: e.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Notas">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={inputClass}
            />
          </Field>
          {error && <p className="text-xs text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              disabled={submitting}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={submitting}
              className={primaryBtn}
            >
              {submitting ? "Guardando…" : "Agregar"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Entrenamiento
// ============================================================

export function TrainingsSection({
  patientId,
  trainings,
  onChanged,
}: {
  patientId: string;
  trainings: PatientTraining[];
  onChanged: () => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    duration: "",
    frequency: "",
    schedule: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    setSubmitting(true);
    try {
      await addTraining(patientId, {
        duration: form.duration.trim() || null,
        frequency: form.frequency.trim() || null,
        schedule: form.schedule.trim() || null,
        notes: form.notes.trim() || null,
      });
      setForm({ duration: "", frequency: "", schedule: "", notes: "" });
      setAdding(false);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta entrada de entrenamiento?")) return;
    try {
      await deleteTraining(patientId, id);
      await onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <Card title="Entrenamiento">
      {trainings.length === 0 && !adding && (
        <p className="text-sm text-gray-500">Sin entradas.</p>
      )}
      <ul className="space-y-3">
        {trainings.map((t, i) => (
          <li
            key={t.id}
            className={`rounded-xl border p-4 ${
              i === 0 ? "bg-brand-50/40 border-brand-200" : "bg-gray-50 border-gray-100"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="text-xs text-gray-500">
                {i === 0 && (
                  <span className="inline-block mr-2 rounded-full bg-brand-600 text-white px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    actual
                  </span>
                )}
                {fmtDateTime(t.createdAt)}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                className="text-xs text-red-700 hover:text-red-800"
              >
                Eliminar
              </button>
            </div>
            <dl className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {t.duration && <KV label="Duración" value={t.duration} />}
              {t.frequency && <KV label="Frecuencia" value={t.frequency} />}
              {t.schedule && (
                <div className="sm:col-span-2">
                  <KV label="Horario" value={t.schedule} block />
                </div>
              )}
              {t.notes && (
                <div className="sm:col-span-2">
                  <KV label="Notas" value={t.notes} block />
                </div>
              )}
            </dl>
          </li>
        ))}
      </ul>

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          + Nueva entrada
        </button>
      ) : (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Duración">
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="Ej. 45 min por sesión"
                className={inputClass}
              />
            </Field>
            <Field label="Frecuencia">
              <input
                type="text"
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value })
                }
                placeholder="Ej. 5 días a la semana"
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Horario">
            <textarea
              rows={2}
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
              placeholder="Ej. 6:30 a 8:00 am en ayunas"
              className={inputClass}
            />
          </Field>
          <Field label="Notas">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={inputClass}
            />
          </Field>
          {error && <p className="text-xs text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              disabled={submitting}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={submitting}
              className={primaryBtn}
            >
              {submitting ? "Guardando…" : "Agregar"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Mediciones (timeline)
// ============================================================

const MEASUREMENT_FIELDS: { key: keyof MeasurementForm; label: string; unit?: string }[] = [
  { key: "weightKg", label: "Peso", unit: "kg" },
  { key: "fatPercent", label: "% grasa" },
  { key: "waterPercent", label: "% agua" },
  { key: "leanMassKg", label: "Masa magra", unit: "kg" },
  { key: "metabolicAge", label: "Edad metabólica" },
  { key: "visceralFat", label: "Grasa visceral" },
  { key: "caliperFatPercent", label: "% grasa cáliper" },
  { key: "chestCm", label: "Pecho", unit: "cm" },
  { key: "waistCm", label: "Cintura", unit: "cm" },
  { key: "abdomenCm", label: "Abdomen", unit: "cm" },
  { key: "hipCm", label: "Cadera", unit: "cm" },
  { key: "armCm", label: "Brazo", unit: "cm" },
  { key: "thighCm", label: "Muslo", unit: "cm" },
  { key: "calfCm", label: "Pantorrilla", unit: "cm" },
];

type MeasurementForm = {
  measuredAt: string;
  visitNumber: string;
  weightKg: string;
  fatPercent: string;
  waterPercent: string;
  leanMassKg: string;
  metabolicAge: string;
  visceralFat: string;
  caliperFatPercent: string;
  chestCm: string;
  waistCm: string;
  abdomenCm: string;
  hipCm: string;
  armCm: string;
  thighCm: string;
  calfCm: string;
  notes: string;
};

function emptyMeasurementForm(): MeasurementForm {
  const today = new Date().toISOString().slice(0, 10);
  return {
    measuredAt: today,
    visitNumber: "",
    weightKg: "",
    fatPercent: "",
    waterPercent: "",
    leanMassKg: "",
    metabolicAge: "",
    visceralFat: "",
    caliperFatPercent: "",
    chestCm: "",
    waistCm: "",
    abdomenCm: "",
    hipCm: "",
    armCm: "",
    thighCm: "",
    calfCm: "",
    notes: "",
  };
}

const DEFAULT_VISIT_LIMIT = 6;

export function MeasurementsSection({
  patientId,
  measurements,
  onChanged,
}: {
  patientId: string;
  measurements: AnthropometricMeasurement[];
  onChanged: () => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState<MeasurementForm>(emptyMeasurementForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function num(v: string): number | null {
    if (v === "") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  function int(v: string): number | null {
    if (v === "") return null;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? null : n;
  }

  async function handleAdd() {
    setError(null);
    setSubmitting(true);
    try {
      await addMeasurement(patientId, {
        appointmentId: null,
        measuredAt: form.measuredAt
          ? new Date(form.measuredAt + "T12:00:00Z").toISOString()
          : new Date().toISOString(),
        visitNumber: int(form.visitNumber),
        weightKg: num(form.weightKg),
        fatPercent: num(form.fatPercent),
        waterPercent: num(form.waterPercent),
        leanMassKg: num(form.leanMassKg),
        metabolicAge: int(form.metabolicAge),
        visceralFat: int(form.visceralFat),
        caliperFatPercent: num(form.caliperFatPercent),
        chestCm: num(form.chestCm),
        waistCm: num(form.waistCm),
        abdomenCm: num(form.abdomenCm),
        hipCm: num(form.hipCm),
        armCm: num(form.armCm),
        thighCm: num(form.thighCm),
        calfCm: num(form.calfCm),
        notes: form.notes.trim() || null,
      });
      setForm(emptyMeasurementForm());
      setAdding(false);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta medición?")) return;
    try {
      await deleteMeasurement(patientId, id);
      await onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  }

  // Las mediciones se muestran como columnas (más reciente a la izquierda)
  const sorted = [...measurements].sort(
    (a, b) =>
      new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
  );

  // Por defecto solo mostramos las últimas N visitas. El resto vive detrás
  // de un toggle "ver todas". Las gráficas (en otra sección) siempre muestran
  // el historial completo.
  const hasOverflow = sorted.length > DEFAULT_VISIT_LIMIT;
  const visibleVisits = showAll ? sorted : sorted.slice(0, DEFAULT_VISIT_LIMIT);

  const rangeLabel =
    sorted.length > 1
      ? `${fmtShortDate(sorted[sorted.length - 1].measuredAt)} → ${fmtShortDate(sorted[0].measuredAt)}`
      : sorted.length === 1
        ? fmtShortDate(sorted[0].measuredAt)
        : null;

  return (
    <Card
      title={
        sorted.length === 0
          ? "Mediciones"
          : `Mediciones · ${sorted.length}${rangeLabel ? ` · ${rangeLabel}` : ""}`
      }
    >
      {sorted.length === 0 && !adding && (
        <p className="text-sm text-gray-500">Sin mediciones registradas.</p>
      )}

      {sorted.length > 0 && (
        <>
          {hasOverflow && (
            <p className="text-xs text-gray-500 mb-3">
              {showAll
                ? `Mostrando todas las ${sorted.length} mediciones.`
                : `Mostrando las últimas ${DEFAULT_VISIT_LIMIT}. La sección "Evolución" más abajo grafica el historial completo.`}
              {" "}
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="font-medium text-brand-700 hover:text-brand-800"
              >
                {showAll
                  ? "Ver solo últimas 6"
                  : `Ver todas las ${sorted.length} →`}
              </button>
            </p>
          )}

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 px-2 font-medium text-gray-500 sticky left-0 bg-white">
                    Medida
                  </th>
                  {visibleVisits.map((m, i) => (
                    <th
                      key={m.id}
                      className={`text-center py-2 px-2 font-medium ${
                        i === 0
                          ? "bg-brand-50/60 text-brand-800 rounded-t-md"
                          : "text-gray-700"
                      }`}
                    >
                      <div>
                        {m.visitNumber
                          ? `#${m.visitNumber}`
                          : `#${sorted.length - sorted.indexOf(m)}`}
                      </div>
                      <div className="text-[10px] text-gray-500 font-normal">
                        {new Date(m.measuredAt).toLocaleDateString("es-GT", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        className="mt-1 text-[10px] text-red-600 hover:text-red-700 font-normal"
                      >
                        ×
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEASUREMENT_FIELDS.map((f) => (
                  <tr key={f.key} className="border-t border-gray-100">
                    <td className="py-1.5 px-2 text-gray-700 sticky left-0 bg-white">
                      {f.label}
                      {f.unit && <span className="text-gray-400"> ({f.unit})</span>}
                    </td>
                    {visibleVisits.map((m, i) => (
                      <td
                        key={m.id}
                        className={`text-center py-1.5 px-2 ${
                          i === 0 ? "bg-brand-50/40 text-brand-900 font-medium" : "text-gray-900"
                        }`}
                      >
                        {(m[f.key as keyof AnthropometricMeasurement] ?? null) !== null
                          ? String(m[f.key as keyof AnthropometricMeasurement])
                          : "—"}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          + Nueva medición
        </button>
      ) : (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Fecha">
              <input
                type="date"
                value={form.measuredAt}
                onChange={(e) =>
                  setForm({ ...form, measuredAt: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="N° de visita">
              <input
                type="number"
                min={1}
                value={form.visitNumber}
                onChange={(e) =>
                  setForm({ ...form, visitNumber: e.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>

          <p className="text-xs uppercase tracking-wider text-gray-500 mt-2">
            Composición
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Peso (kg)">
              <input
                type="number"
                step="0.1"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="% grasa">
              <input
                type="number"
                step="0.1"
                value={form.fatPercent}
                onChange={(e) =>
                  setForm({ ...form, fatPercent: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="% agua">
              <input
                type="number"
                step="0.1"
                value={form.waterPercent}
                onChange={(e) =>
                  setForm({ ...form, waterPercent: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Masa magra (kg)">
              <input
                type="number"
                step="0.1"
                value={form.leanMassKg}
                onChange={(e) =>
                  setForm({ ...form, leanMassKg: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Edad metabólica">
              <input
                type="number"
                value={form.metabolicAge}
                onChange={(e) =>
                  setForm({ ...form, metabolicAge: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Grasa visceral">
              <input
                type="number"
                value={form.visceralFat}
                onChange={(e) =>
                  setForm({ ...form, visceralFat: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="% grasa cáliper">
              <input
                type="number"
                step="0.1"
                value={form.caliperFatPercent}
                onChange={(e) =>
                  setForm({ ...form, caliperFatPercent: e.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>

          <p className="text-xs uppercase tracking-wider text-gray-500 mt-2">
            Circunferencias (cm)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["chestCm", "waistCm", "abdomenCm", "hipCm", "armCm", "thighCm", "calfCm"] as const).map(
              (k) => {
                const f = MEASUREMENT_FIELDS.find((m) => m.key === k)!;
                return (
                  <Field key={k} label={f.label}>
                    <input
                      type="number"
                      step="0.1"
                      value={form[k]}
                      onChange={(e) =>
                        setForm({ ...form, [k]: e.target.value })
                      }
                      className={inputClass}
                    />
                  </Field>
                );
              },
            )}
          </div>

          <Field label="Notas">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={inputClass}
            />
          </Field>
          {error && <p className="text-xs text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              disabled={submitting}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={submitting}
              className={primaryBtn}
            >
              {submitting ? "Guardando…" : "Agregar medición"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Plan alimentario
// ============================================================

const MEAL_FIELDS: { key: keyof MealForm; label: string }[] = [
  { key: "breakfast", label: "Desayuno" },
  { key: "morningSnack", label: "Refacción matutina" },
  { key: "lunch", label: "Almuerzo" },
  { key: "afternoonSnack", label: "Refacción vespertina" },
  { key: "dinner", label: "Cena" },
];

type MealForm = {
  title: string;
  breakfast: string;
  morningSnack: string;
  lunch: string;
  afternoonSnack: string;
  dinner: string;
  notes: string;
};

function emptyMealForm(): MealForm {
  return {
    title: "",
    breakfast: "",
    morningSnack: "",
    lunch: "",
    afternoonSnack: "",
    dinner: "",
    notes: "",
  };
}

export function MealPlansSection({
  patientId,
  mealPlans,
  onChanged,
}: {
  patientId: string;
  mealPlans: MealPlanRecord[];
  onChanged: () => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<MealForm>(emptyMealForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  }

  async function handleAdd() {
    setError(null);
    setSubmitting(true);
    try {
      await addMealPlan(patientId, {
        title: form.title.trim() || null,
        breakfast: form.breakfast.trim() || null,
        morningSnack: form.morningSnack.trim() || null,
        lunch: form.lunch.trim() || null,
        afternoonSnack: form.afternoonSnack.trim() || null,
        dinner: form.dinner.trim() || null,
        notes: form.notes.trim() || null,
      });
      setForm(emptyMealForm());
      setAdding(false);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este plan alimentario?")) return;
    try {
      await deleteMealPlan(patientId, id);
      await onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <Card title="Plan alimentario">
      {mealPlans.length === 0 && !adding && (
        <p className="text-sm text-gray-500">Sin planes registrados.</p>
      )}

      <ul className="space-y-3">
        {mealPlans.map((mp, i) => {
          const isOpen = expanded.has(mp.id) || i === 0;
          return (
            <li
              key={mp.id}
              className={`rounded-xl border ${
                i === 0 ? "bg-brand-50/40 border-brand-200" : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {mp.title ?? "Plan alimentario"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {i === 0 && (
                      <span className="inline-block mr-2 rounded-full bg-brand-600 text-white px-2 py-0.5 text-[10px] uppercase tracking-wider align-middle">
                        actual
                      </span>
                    )}
                    {fmtDateTime(mp.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggle(mp.id)}
                    className="text-xs text-gray-600 hover:text-gray-900"
                  >
                    {isOpen ? "Ocultar" : "Ver"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(mp.id)}
                    className="text-xs text-red-700 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 space-y-2 text-sm">
                  {MEAL_FIELDS.map(({ key, label }) => {
                    const v = mp[key as keyof MealPlanRecord] as string | null;
                    if (!v) return null;
                    return (
                      <div key={key}>
                        <p className="text-xs font-medium uppercase tracking-wider text-brand-700">
                          {label}
                        </p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap mt-0.5">
                          {v}
                        </p>
                      </div>
                    );
                  })}
                  {mp.notes && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Notas
                      </p>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap mt-0.5">
                        {mp.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          + Nuevo plan alimentario
        </button>
      ) : (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <Field label="Título (opcional)">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej. Plan inicial, Plan ajustado abril"
              className={inputClass}
            />
          </Field>
          {MEAL_FIELDS.map(({ key, label }) => (
            <Field key={key} label={label}>
              <textarea
                rows={3}
                value={form[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
                placeholder="Hora y lugar + descripción"
                className={inputClass}
              />
            </Field>
          ))}
          <Field label="Notas">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={inputClass}
            />
          </Field>
          {error && <p className="text-xs text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              disabled={submitting}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={submitting}
              className={primaryBtn}
            >
              {submitting ? "Guardando…" : "Agregar plan"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Helpers compartidos
// ============================================================

const inputClass =
  "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

const primaryBtn =
  "rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function KV({
  label,
  value,
  block,
}: {
  label: string;
  value: string;
  block?: boolean;
}) {
  if (block) {
    return (
      <div>
        <dt className="text-xs text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-800 whitespace-pre-wrap mt-0.5">
          {value}
        </dd>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <dt className="text-xs text-gray-500 shrink-0 w-32">{label}</dt>
      <dd className="text-sm text-gray-800 break-words">{value}</dd>
    </div>
  );
}

function KVSmall({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-gray-500">
        {label}
      </dt>
      <dd className="text-xs text-gray-800 font-medium">{value}</dd>
    </div>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-GT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-GT", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function ageFrom(birthDate: string | null): string {
  if (!birthDate) return "—";
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return `${age} años`;
}
