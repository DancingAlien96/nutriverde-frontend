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
  sendMealPlan,
  updatePatient,
  type AnthropometricMeasurement,
  type MealPlanRecord,
  type PatientDetail,
  type PatientDiagnosis,
  type PatientTraining,
  type PatientUpdatePatch,
} from "../../../lib/admin";
import { useAdminT, type AdminDict } from "../../../lib/admin-i18n";
import { CollapsibleSection } from "../../CollapsibleSection";

type ClinicalDict = AdminDict["clinical"];

// ============================================================
// Static clinical data
// ============================================================

export function StaticHealthSection({
  patient,
  onSaved,
}: {
  patient: PatientDetail;
  onSaved: () => Promise<void>;
}) {
  const t = useAdminT();
  const c = t.clinical;
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
      setError(err instanceof Error ? err.message : c.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  const dash = c.common.dash;

  return (
    <Card title={c.static.title}>
      {!editing ? (
        <div className="space-y-1.5 text-sm">
          <KV label={c.static.birthDate} value={fmtDate(patient.birthDate, t.dateLocale, dash)} />
          <KV
            label={c.static.age}
            value={ageFrom(patient.birthDate, { years: c.static.years, dash })}
          />
          <KV
            label={c.static.height}
            value={patient.heightCm ? `${(patient.heightCm / 100).toFixed(2)} m` : dash}
          />
          <KV label={c.static.allergies} value={patient.allergies ?? dash} block />
          <KV label={c.static.medicalConditions} value={patient.medicalConditions ?? dash} block />
          <KV label={c.static.medications} value={patient.medications ?? dash} block />
          <KV label={c.static.alcohol} value={patient.alcoholNotes ?? dash} />
          <KV label={c.static.cravings} value={patient.cravingsNotes ?? dash} />
          <KV label={c.static.waterCoffee} value={patient.waterCoffeeNotes ?? dash} />
          <KV label={c.static.dislikedFoods} value={patient.dislikedFoods ?? dash} block />
          <KV
            label={c.static.weekendSpots}
            value={patient.weekendSpots ?? dash}
            block
          />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-3 text-xs font-medium text-brand-700 hover:text-brand-800"
          >
            {c.common.edit}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={c.static.birthDate}>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label={c.static.heightCm}>
              <input
                type="number"
                min={0}
                max={250}
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                placeholder={c.static.heightPh}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label={c.static.allergiesLong}>
            <textarea
              rows={2}
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label={c.static.medicalConditions}>
            <textarea
              rows={2}
              value={form.medicalConditions}
              onChange={(e) =>
                setForm({ ...form, medicalConditions: e.target.value })
              }
              className={inputClass}
            />
          </Field>
          <Field label={c.static.medicationsLong}>
            <textarea
              rows={2}
              value={form.medications}
              onChange={(e) => setForm({ ...form, medications: e.target.value })}
              className={inputClass}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={c.static.alcohol}>
              <input
                type="text"
                value={form.alcoholNotes}
                onChange={(e) =>
                  setForm({ ...form, alcoholNotes: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label={c.static.cravings}>
              <input
                type="text"
                value={form.cravingsNotes}
                onChange={(e) =>
                  setForm({ ...form, cravingsNotes: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label={c.static.waterCoffeeLong}>
              <input
                type="text"
                value={form.waterCoffeeNotes}
                onChange={(e) =>
                  setForm({ ...form, waterCoffeeNotes: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label={c.static.dislikedFoods}>
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
          <Field label={c.static.weekendSpotsLong}>
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
              {c.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting}
              className={primaryBtn}
            >
              {submitting ? c.common.saving : c.common.save}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Diagnosis
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
  const t = useAdminT();
  const c = t.clinical;
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
      setError(err instanceof Error ? err.message : c.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(c.diagnoses.confirmDelete)) return;
    try {
      await deleteDiagnosis(patientId, id);
      await onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : c.common.error);
    }
  }

  return (
    <Card
      title={c.diagnoses.title}
      summary={countLabel(diagnoses.length, c.common.entryOne, c.common.entryMany, c.common.noneYet)}
    >
      {diagnoses.length === 0 && !adding && (
        <p className="text-sm text-gray-500">{c.common.noEntries}</p>
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
                    {c.common.current}
                  </span>
                )}
                {fmtDateTime(d.createdAt, t.dateLocale)}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(d.id)}
                className="text-xs text-red-700 hover:text-red-800"
              >
                {c.common.delete}
              </button>
            </div>
            {d.objective && (
              <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                <strong className="text-gray-900">{c.diagnoses.goal}:</strong> {d.objective}
              </p>
            )}
            <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
              {d.goalFatPercent != null && (
                <KVSmall label={c.diagnoses.targetFatPercent} value={`${d.goalFatPercent}%`} />
              )}
              {d.goalFatLossLbs != null && (
                <KVSmall label={c.diagnoses.targetFatLossLbs} value={`${d.goalFatLossLbs} lb`} />
              )}
              {d.goalLeanMassKg != null && (
                <KVSmall label={c.diagnoses.targetLeanMass} value={`${d.goalLeanMassKg} kg`} />
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
          {c.common.newEntry}
        </button>
      ) : (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <Field label={c.diagnoses.goal}>
            <textarea
              rows={2}
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              placeholder={c.diagnoses.goalPh}
              className={inputClass}
            />
          </Field>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label={c.diagnoses.targetFatPercent}>
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
            <Field label={c.diagnoses.targetFatLossLbs}>
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
            <Field label={c.diagnoses.targetLeanMassKg}>
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
          <Field label={c.common.notes}>
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
              {c.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={submitting}
              className={primaryBtn}
            >
              {submitting ? c.common.saving : c.common.add}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Training
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
  const t = useAdminT();
  const c = t.clinical;
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
      setError(err instanceof Error ? err.message : c.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(c.trainings.confirmDelete)) return;
    try {
      await deleteTraining(patientId, id);
      await onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : c.common.error);
    }
  }

  return (
    <Card
      title={c.trainings.title}
      summary={countLabel(trainings.length, c.common.entryOne, c.common.entryMany, c.common.noneYet)}
    >
      {trainings.length === 0 && !adding && (
        <p className="text-sm text-gray-500">{c.common.noEntries}</p>
      )}
      <ul className="space-y-3">
        {trainings.map((tr, i) => (
          <li
            key={tr.id}
            className={`rounded-xl border p-4 ${
              i === 0 ? "bg-brand-50/40 border-brand-200" : "bg-gray-50 border-gray-100"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="text-xs text-gray-500">
                {i === 0 && (
                  <span className="inline-block mr-2 rounded-full bg-brand-600 text-white px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    {c.common.current}
                  </span>
                )}
                {fmtDateTime(tr.createdAt, t.dateLocale)}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(tr.id)}
                className="text-xs text-red-700 hover:text-red-800"
              >
                {c.common.delete}
              </button>
            </div>
            <dl className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {tr.duration && <KV label={c.trainings.duration} value={tr.duration} />}
              {tr.frequency && <KV label={c.trainings.frequency} value={tr.frequency} />}
              {tr.schedule && (
                <div className="sm:col-span-2">
                  <KV label={c.trainings.schedule} value={tr.schedule} block />
                </div>
              )}
              {tr.notes && (
                <div className="sm:col-span-2">
                  <KV label={c.common.notes} value={tr.notes} block />
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
          {c.common.newEntry}
        </button>
      ) : (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={c.trainings.duration}>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder={c.trainings.durationPh}
                className={inputClass}
              />
            </Field>
            <Field label={c.trainings.frequency}>
              <input
                type="text"
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value })
                }
                placeholder={c.trainings.frequencyPh}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label={c.trainings.schedule}>
            <textarea
              rows={2}
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
              placeholder={c.trainings.schedulePh}
              className={inputClass}
            />
          </Field>
          <Field label={c.common.notes}>
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
              {c.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={submitting}
              className={primaryBtn}
            >
              {submitting ? c.common.saving : c.common.add}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Measurements (timeline)
// ============================================================

/** Campos numéricos de la medición; la etiqueta visible sale del diccionario. */
type MeasurementFieldKey = keyof ClinicalDict["measurements"]["fields"];

const MEASUREMENT_FIELDS: { key: MeasurementFieldKey; unit?: string }[] = [
  { key: "weightKg", unit: "kg" },
  { key: "fatPercent" },
  { key: "waterPercent" },
  { key: "leanMassKg", unit: "kg" },
  { key: "metabolicAge" },
  { key: "visceralFat" },
  { key: "caliperFatPercent" },
  { key: "chestCm", unit: "cm" },
  { key: "waistCm", unit: "cm" },
  { key: "abdomenCm", unit: "cm" },
  { key: "hipCm", unit: "cm" },
  { key: "armCm", unit: "cm" },
  { key: "thighCm", unit: "cm" },
  { key: "calfCm", unit: "cm" },
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
  const t = useAdminT();
  const c = t.clinical;
  const ms = c.measurements;
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
      setError(err instanceof Error ? err.message : c.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(ms.confirmDelete)) return;
    try {
      await deleteMeasurement(patientId, id);
      await onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : c.common.error);
    }
  }

  // Measurements are shown as columns (most recent on the left)
  const sorted = [...measurements].sort(
    (a, b) =>
      new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
  );

  // By default we only show the last N visits. The rest live behind
  // a "show all" toggle. The charts (in another section) always show
  // the full history.
  const hasOverflow = sorted.length > DEFAULT_VISIT_LIMIT;
  const visibleVisits = showAll ? sorted : sorted.slice(0, DEFAULT_VISIT_LIMIT);

  const rangeLabel =
    sorted.length > 1
      ? `${fmtShortDate(sorted[sorted.length - 1].measuredAt, t.dateLocale)} → ${fmtShortDate(sorted[0].measuredAt, t.dateLocale)}`
      : sorted.length === 1
        ? fmtShortDate(sorted[0].measuredAt, t.dateLocale)
        : null;

  return (
    <Card
      title={ms.title}
      summary={
        sorted.length === 0
          ? c.common.noneYet
          : `${sorted.length}${rangeLabel ? ` · ${rangeLabel}` : ""}`
      }
    >
      {sorted.length === 0 && !adding && (
        <p className="text-sm text-gray-500">{ms.none}</p>
      )}

      {sorted.length > 0 && (
        <>
          {hasOverflow && (
            <p className="text-xs text-gray-500 mb-3">
              {showAll
                ? fillN(ms.showingAll, sorted.length)
                : fillN(ms.showingLast, DEFAULT_VISIT_LIMIT)}
              {" "}
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="font-medium text-brand-700 hover:text-brand-800"
              >
                {showAll
                  ? fillN(ms.showOnlyLast, DEFAULT_VISIT_LIMIT)
                  : fillN(ms.showAll, sorted.length)}
              </button>
            </p>
          )}

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 px-2 font-medium text-gray-500 sticky left-0 bg-white">
                    {ms.measure}
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
                        {new Date(m.measuredAt).toLocaleDateString(t.dateLocale, {
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
                      {ms.fields[f.key]}
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
                          : c.common.dash}
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
          {ms.newMeasurement}
        </button>
      ) : (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label={ms.date}>
              <input
                type="date"
                value={form.measuredAt}
                onChange={(e) =>
                  setForm({ ...form, measuredAt: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label={ms.visitNo}>
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
            {ms.composition}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label={ms.weightKg}>
              <input
                type="number"
                step="0.1"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label={ms.fields.fatPercent}>
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
            <Field label={ms.fields.waterPercent}>
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
            <Field label={ms.leanMassKg}>
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
            <Field label={ms.fields.metabolicAge}>
              <input
                type="number"
                value={form.metabolicAge}
                onChange={(e) =>
                  setForm({ ...form, metabolicAge: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label={ms.fields.visceralFat}>
              <input
                type="number"
                value={form.visceralFat}
                onChange={(e) =>
                  setForm({ ...form, visceralFat: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label={ms.fields.caliperFatPercent}>
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
            {ms.circumferencesCm}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["chestCm", "waistCm", "abdomenCm", "hipCm", "armCm", "thighCm", "calfCm"] as const).map(
              (k) => {
                return (
                  <Field key={k} label={ms.fields[k]}>
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

          <Field label={c.common.notes}>
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
              {c.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={submitting}
              className={primaryBtn}
            >
              {submitting ? c.common.saving : ms.addMeasurement}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Meal plan
// ============================================================

/** Tiempos de comida del plan; la etiqueta visible sale del diccionario. */
type MealKey = keyof ClinicalDict["mealPlans"]["meals"];

const MEAL_FIELDS: MealKey[] = [
  "breakfast",
  "morningSnack",
  "lunch",
  "afternoonSnack",
  "dinner",
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
  const t = useAdminT();
  const c = t.clinical;
  const mpl = c.mealPlans;
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<MealForm>(emptyMealForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentInfo, setSentInfo] = useState<{ id: string; to: string } | null>(
    null,
  );

  async function handleSend(id: string) {
    setSendingId(id);
    setSentInfo(null);
    setError(null);
    try {
      const { sentTo } = await sendMealPlan(patientId, id);
      setSentInfo({ id, to: sentTo });
    } catch (err) {
      setError(err instanceof Error ? err.message : mpl.sendError);
    } finally {
      setSendingId(null);
    }
  }

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
      setError(err instanceof Error ? err.message : c.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(mpl.confirmDelete)) return;
    try {
      await deleteMealPlan(patientId, id);
      await onChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : c.common.error);
    }
  }

  return (
    <Card
      title={mpl.title}
      summary={countLabel(mealPlans.length, mpl.planOne, mpl.planMany, c.common.noneYet)}
    >
      {mealPlans.length === 0 && !adding && (
        <p className="text-sm text-gray-500">{mpl.none}</p>
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
                    {mp.title ?? mpl.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {i === 0 && (
                      <span className="inline-block mr-2 rounded-full bg-brand-600 text-white px-2 py-0.5 text-[10px] uppercase tracking-wider align-middle">
                        {c.common.current}
                      </span>
                    )}
                    {fmtDateTime(mp.createdAt, t.dateLocale)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSend(mp.id)}
                    disabled={sendingId === mp.id}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800 disabled:opacity-50"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {sendingId === mp.id ? mpl.sending : mpl.email}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(mp.id)}
                    className="text-xs text-gray-600 hover:text-gray-900"
                  >
                    {isOpen ? mpl.hide : mpl.view}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(mp.id)}
                    className="text-xs text-red-700 hover:text-red-800"
                  >
                    {c.common.delete}
                  </button>
                </div>
              </div>
              {sentInfo?.id === mp.id && (
                <p className="px-4 -mt-2 pb-2 text-xs text-brand-700 inline-flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {mpl.sentTo} {sentInfo.to}
                </p>
              )}
              {isOpen && (
                <div className="px-4 pb-4 space-y-2 text-sm">
                  {MEAL_FIELDS.map((key) => {
                    const v = mp[key as keyof MealPlanRecord] as string | null;
                    if (!v) return null;
                    return (
                      <div key={key}>
                        <p className="text-xs font-medium uppercase tracking-wider text-brand-700">
                          {mpl.meals[key]}
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
                        {c.common.notes}
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

      {error && !adding && (
        <p className="mt-3 text-xs text-red-700">{error}</p>
      )}

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 text-xs font-medium text-brand-700 hover:text-brand-800"
        >
          {mpl.newPlan}
        </button>
      ) : null}
      {adding && (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <Field label={mpl.titleOptional}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={mpl.titlePh}
              className={inputClass}
            />
          </Field>
          {MEAL_FIELDS.map((key) => (
            <Field key={key} label={mpl.meals[key]}>
              <textarea
                rows={3}
                value={form[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
                placeholder={mpl.mealPh}
                className={inputClass}
              />
            </Field>
          ))}
          <Field label={c.common.notes}>
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
              {c.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={submitting}
              className={primaryBtn}
            >
              {submitting ? c.common.saving : mpl.addPlan}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Shared helpers
// ============================================================

const inputClass =
  "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

const primaryBtn =
  "rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white";

/** Tarjeta de sección del expediente: se despliega hacia abajo. */
function Card({
  title,
  summary,
  children,
}: {
  title: string;
  /** Resumen corto junto al título (cuántos registros hay). */
  summary?: string;
  children: React.ReactNode;
}) {
  return (
    <CollapsibleSection title={title} summary={summary}>
      {children}
    </CollapsibleSection>
  );
}

function countLabel(n: number, one: string, many: string, noneYet: string): string {
  if (n === 0) return noneYet;
  return `${n} ${n === 1 ? one : many}`;
}

/** Sustituye el marcador `{n}` de un texto del diccionario. */
function fillN(template: string, n: number): string {
  return template.replace("{n}", String(n));
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

function fmtDate(iso: string | null, locale: string, dash: string): string {
  if (!iso) return dash;
  return new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fmtDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShortDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function ageFrom(
  birthDate: string | null,
  words: { years: string; dash: string },
): string {
  if (!birthDate) return words.dash;
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return `${age} ${words.years}`;
}
