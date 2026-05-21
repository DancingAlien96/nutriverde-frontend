"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell";
import {
  createAdminService,
  deleteAdminService,
  listAdminServices,
  updateAdminService,
  type ServiceAdmin,
} from "../../lib/admin";

export default function ServicesPage() {
  return (
    <AdminShell>
      <Content />
    </AdminShell>
  );
}

function Content() {
  const [services, setServices] = useState<ServiceAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function reload() {
    setError(null);
    try {
      const { services: s } = await listAdminServices();
      setServices(s);
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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-gray-900">Servicios</h1>
          <p className="text-sm text-gray-600 mt-1">
            Edita o crea servicios. Los cambios se reflejan inmediatamente en la
            página pública.
          </p>
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-medium text-white shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo servicio
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {creating && (
          <NewServiceForm
            onCancel={() => setCreating(false)}
            onCreated={async () => {
              setCreating(false);
              await reload();
            }}
          />
        )}
        {services.map((s) => (
          <ServiceCard
            key={s.id}
            service={s}
            onSaved={reload}
            onDeleted={reload}
            onError={(msg) => setError(msg)}
          />
        ))}
      </div>
    </>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function NewServiceForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [billingType, setBillingType] = useState<"ONE_TIME" | "MONTHLY">(
    "ONE_TIME",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleCreate() {
    setError(null);
    const priceCents = Math.round(Number(price) * 100);
    const durationMin = Number(duration);
    if (!name.trim()) return setError("El nombre es obligatorio.");
    if (!slug.trim()) return setError("El slug es obligatorio.");
    if (Number.isNaN(priceCents) || priceCents < 0) return setError("Precio inválido.");
    if (Number.isNaN(durationMin) || durationMin < 0) return setError("Duración inválida.");

    setSubmitting(true);
    try {
      await createAdminService({
        slug: slug.trim(),
        name: name.trim(),
        description: description.trim(),
        priceCents,
        durationMin,
        billingType,
      });
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-brand-200 ring-2 ring-brand-100 p-5">
      <p className="text-xs uppercase tracking-wider text-brand-700 font-semibold mb-3">
        Nuevo servicio
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs">
          Nombre *
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ej. Consulta Express"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs">
          Slug (URL) *
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="consulta-express"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
          />
          <span className="block text-[10px] text-gray-500 mt-0.5">
            Minúsculas, números y guiones. Se autogenera del nombre.
          </span>
        </label>

        <label className="text-xs">
          Precio (Q) *
          <input
            type="number"
            step="1"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="350"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs">
          Duración (minutos) *
          <input
            type="number"
            step="5"
            min="0"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs">
          Tipo
          <select
            value={billingType}
            onChange={(e) =>
              setBillingType(e.target.value as "ONE_TIME" | "MONTHLY")
            }
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            <option value="ONE_TIME">Pago único</option>
            <option value="MONTHLY">Mensual</option>
          </select>
        </label>

        <label className="text-xs sm:col-span-2">
          Descripción
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Qué incluye este servicio…"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

      <div className="mt-5 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-5 py-2 text-sm font-medium text-white"
        >
          {submitting ? "Creando…" : "Crear servicio"}
        </button>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  onSaved,
  onDeleted,
  onError,
}: {
  service: ServiceAdmin;
  onSaved: () => Promise<void>;
  onDeleted: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [price, setPrice] = useState((service.priceCents / 100).toString());
  const [duration, setDuration] = useState(service.durationMin.toString());
  const [billingType, setBillingType] = useState<"ONE_TIME" | "MONTHLY">(
    service.billingType,
  );
  const [active, setActive] = useState(service.active);
  const [sortOrder, setSortOrder] = useState(service.sortOrder.toString());
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (
      !confirm(
        `¿Eliminar "${service.name}"? Esta acción no se puede deshacer. Si el servicio ya tiene citas, no se podrá borrar (mejor desactivarlo).`,
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteAdminService(service.id);
      await onDeleted();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error al eliminar.");
    } finally {
      setDeleting(false);
    }
  }

  function reset() {
    setName(service.name);
    setDescription(service.description);
    setPrice((service.priceCents / 100).toString());
    setDuration(service.durationMin.toString());
    setBillingType(service.billingType);
    setActive(service.active);
    setSortOrder(service.sortOrder.toString());
    setError(null);
  }

  async function handleSave() {
    setError(null);
    const priceCents = Math.round(Number(price) * 100);
    const durationMin = Number(duration);
    if (Number.isNaN(priceCents) || priceCents < 0) {
      setError("Precio inválido.");
      return;
    }
    if (Number.isNaN(durationMin) || durationMin < 0) {
      setError("Duración inválida.");
      return;
    }

    setSubmitting(true);
    try {
      await updateAdminService(service.id, {
        name: name.trim(),
        description: description.trim(),
        priceCents,
        durationMin,
        billingType,
        active,
        sortOrder: Number(sortOrder) || 0,
      });
      setEditing(false);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!editing) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
              {!service.active && (
                <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Inactivo
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">slug: {service.slug}</p>
            <p className="mt-2 text-sm text-gray-700 line-clamp-2">
              {service.description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-serif-display text-2xl text-brand-700">
              {service.currency === "GTQ" ? "Q" : `${service.currency} `}
              {(service.priceCents / 100).toFixed(0)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {service.billingType === "MONTHLY"
                ? "Mensual"
                : `${service.durationMin} min`}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-medium text-red-700 hover:text-red-800 disabled:opacity-60"
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-brand-700 hover:text-brand-800"
          >
            Editar →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-brand-200 ring-2 ring-brand-100 p-5">
      <p className="text-xs uppercase tracking-wider text-brand-700 font-semibold mb-3">
        Editar servicio
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs">
          Nombre
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs">
          Precio (en {service.currency})
          <input
            type="number"
            step="1"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs">
          Duración (minutos)
          <input
            type="number"
            step="5"
            min="0"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs">
          Tipo
          <select
            value={billingType}
            onChange={(e) =>
              setBillingType(e.target.value as "ONE_TIME" | "MONTHLY")
            }
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            <option value="ONE_TIME">Pago único</option>
            <option value="MONTHLY">Mensual</option>
          </select>
        </label>

        <label className="text-xs sm:col-span-2">
          Descripción
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
          />
        </label>

        <label className="text-xs">
          Orden de aparición
          <input
            type="number"
            step="1"
            min="0"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-end gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 mb-2 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="mb-1.5">Activo (visible al público)</span>
        </label>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-700">{error}</p>
      )}

      <div className="mt-5 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            reset();
            setEditing(false);
          }}
          disabled={submitting}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-5 py-2 text-sm font-medium text-white"
        >
          {submitting ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
