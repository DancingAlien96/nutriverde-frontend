"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell";
import {
  createAdminService,
  deleteAdminService,
  listAdminServices,
  updateAdminService,
  uploadServiceImage,
  type ServiceAdmin,
} from "../../lib/admin";
import { backendImageSrc } from "../../lib/api";

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

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-gray-900">Services</h1>
          <p className="text-sm text-gray-600 mt-1">
            Edit or create services. Changes are reflected immediately on the
            public site.
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
            New service
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
        {creating && (
          <div className="col-span-full">
            <NewServiceForm
              onCancel={() => setCreating(false)}
              onCreated={async () => {
                setCreating(false);
                await reload();
              }}
            />
          </div>
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
  const [imageFile, setImageFile] = useState<File | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleCreate() {
    setError(null);
    const priceCents = Math.round(Number(price) * 100);
    const durationMin = Number(duration);
    if (!name.trim()) return setError("Name is required.");
    if (!slug.trim()) return setError("Slug is required.");
    if (Number.isNaN(priceCents) || priceCents < 0) return setError("Invalid price.");
    if (Number.isNaN(durationMin) || durationMin < 0) return setError("Invalid duration.");

    setSubmitting(true);
    try {
      const { service } = await createAdminService({
        slug: slug.trim(),
        name: name.trim(),
        description: description.trim(),
        priceCents,
        durationMin,
        billingType,
      });
      if (imageFile) await uploadServiceImage(service.id, imageFile);
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
        New service
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs">
          Name *
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Express Consultation"
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
            placeholder="express-consultation"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
          />
          <span className="block text-[10px] text-gray-500 mt-0.5">
            Lowercase, numbers and hyphens. Auto-generated from the name.
          </span>
        </label>

        <label className="text-xs">
          Price (Q) *
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
          Duration (minutes) *
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
          Type
          <select
            value={billingType}
            onChange={(e) =>
              setBillingType(e.target.value as "ONE_TIME" | "MONTHLY")
            }
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            <option value="ONE_TIME">One-time payment</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </label>

        <label className="text-xs sm:col-span-2">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What this service includes…"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
          />
        </label>

        <label className="text-xs sm:col-span-2">
          Image (optional)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600 mt-1 file:mr-3 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-brand-700 hover:file:bg-brand-200"
          />
          {imageFile && (
            <span className="block text-[10px] text-gray-500 mt-1">
              {imageFile.name}
            </span>
          )}
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
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-5 py-2 text-sm font-medium text-white"
        >
          {submitting ? "Creating…" : "Create service"}
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
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function handleDelete() {
    if (
      !confirm(
        `Delete "${service.name}"? This action cannot be undone. If the service already has appointments, it can't be deleted (better to deactivate it).`,
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteAdminService(service.id);
      await onDeleted();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to delete.");
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
      setError("Invalid price.");
      return;
    }
    if (Number.isNaN(durationMin) || durationMin < 0) {
      setError("Invalid duration.");
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
      if (imageFile) await uploadServiceImage(service.id, imageFile);
      setImageFile(null);
      setEditing(false);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!editing) {
    const thumb = backendImageSrc(service.imageUrl);
    return (
      <div className="rounded-2xl bg-white border border-cream-200 p-5 flex flex-col h-full">
        {thumb && (
          <div className="relative -mx-5 -mt-5 mb-4 h-32 overflow-hidden rounded-t-2xl bg-cream-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb}
              alt={service.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-ink-900">{service.name}</h3>
              {!service.active && (
                <span className="text-[10px] uppercase tracking-wider text-ink-500 bg-cream-100 px-2 py-0.5 rounded-full">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-xs text-ink-500 mt-0.5">slug: {service.slug}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-serif-display text-2xl text-brand-700">
              {service.currency === "GTQ" ? "Q" : `${service.currency} `}
              {(service.priceCents / 100).toFixed(0)}
            </p>
            <p className="text-xs text-ink-500 mt-0.5">
              {service.billingType === "MONTHLY"
                ? "Monthly"
                : `${service.durationMin} min`}
            </p>
          </div>
        </div>

        <p className="mt-3 text-sm text-ink-700 line-clamp-3">
          {service.description}
        </p>

        <div className="mt-auto pt-4 flex justify-end gap-4 border-t border-cream-100">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-medium text-red-700 hover:text-red-800 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-brand-700 hover:text-brand-800"
          >
            Edit →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-full rounded-2xl bg-white border border-brand-200 ring-2 ring-brand-100 p-5">
      <p className="text-xs uppercase tracking-wider text-brand-700 font-semibold mb-3">
        Edit service
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs">
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs">
          Price (in {service.currency})
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
          Duration (minutes)
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
          Type
          <select
            value={billingType}
            onChange={(e) =>
              setBillingType(e.target.value as "ONE_TIME" | "MONTHLY")
            }
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            <option value="ONE_TIME">One-time payment</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </label>

        <label className="text-xs sm:col-span-2">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
          />
        </label>

        <div className="text-xs sm:col-span-2">
          Image
          <div className="mt-1 flex items-center gap-3">
            {backendImageSrc(service.imageUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={backendImageSrc(service.imageUrl) as string}
                alt={service.name}
                className="h-16 w-16 rounded-lg object-cover border border-gray-200"
              />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="block text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-brand-100 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-brand-700 hover:file:bg-brand-200"
            />
          </div>
          {imageFile && (
            <span className="block text-[10px] text-gray-500 mt-1">
              New: {imageFile.name}
            </span>
          )}
        </div>

        <label className="text-xs">
          Display order
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
          <span className="mb-1.5">Active (visible to the public)</span>
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
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-5 py-2 text-sm font-medium text-white"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
