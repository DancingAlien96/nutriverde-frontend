"use client";

import { useEffect, useState } from "react";
import {
  centsToInput,
  convertAppointmentToPackage,
  formatMoney,
  listSchedulableServices,
  parseMoney,
  type ChargeSummary,
  type SchedulableService,
} from "../../../lib/admin";
import { useAdminT } from "../../../lib/admin-i18n";
import { Collapse } from "../../Collapse";

const inputCls =
  "w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

/**
 * "Convertir en programa": la paciente vino a una cita suelta (consulta
 * inicial) y ese dia decide comprar un programa. La cita pasa a ser la
 * sesion 1 del paquete y lo que ya pago se descuenta del precio del programa.
 */
/** Lo minimo de la cita que hace falta: id, moneda y lo ya pagado. */
interface ConvertibleAppointment {
  id: string;
  service: { currency?: string };
  charge?: ChargeSummary | null;
  payment?: { status: string; amountCents: number } | null;
}

export function ConvertToPackage({
  appointment: a,
  onChanged,
}: {
  appointment: ConvertibleAppointment;
  onChanged: () => void;
}) {
  const t = useAdminT();
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<SchedulableService[] | null>(null);
  const [serviceId, setServiceId] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Programas (varias sesiones), cargados al abrir por primera vez.
  useEffect(() => {
    if (!open || services !== null) return;
    let cancelled = false;
    listSchedulableServices()
      .then(({ services: list }) => {
        if (cancelled) return;
        const programs = list.filter((s) => s.sessions > 1);
        setServices(programs);
        const first = programs[0];
        if (first) {
          setServiceId(first.id);
          setPrice(centsToInput(first.priceCents));
        }
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, services]);

  const service = services?.find((s) => s.id === serviceId) ?? null;
  const currency = service?.currency ?? a.service.currency ?? "GTQ";
  // Lo ya pagado por esta cita: abonos del panel o comprobante web aprobado.
  const carried =
    (a.charge?.paidCents ?? 0) +
    (a.payment && a.payment.status === "APPROVED" ? a.payment.amountCents : 0);
  const priceCents = parseMoney(price);
  const balance = priceCents != null ? Math.max(0, priceCents - carried) : null;
  const priceTooLow = priceCents != null && priceCents < carried;

  function pickService(id: string) {
    setServiceId(id);
    const s = services?.find((x) => x.id === id);
    if (s) setPrice(centsToInput(s.priceCents));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!service || priceCents == null || priceTooLow || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await convertAppointmentToPackage(a.id, {
        serviceId: service.id,
        priceCents: priceCents !== service.priceCents ? priceCents : undefined,
      });
      setOpen(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  const c = t.record.convert;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-xs font-medium text-brand-700 hover:text-brand-900 hover:underline underline-offset-2"
      >
        {open ? t.common.close : c.button}
      </button>
      <Collapse open={open}>
        <form
          onSubmit={submit}
          className="mt-2 rounded-xl border border-brand-200 bg-brand-50/40 p-3 sm:p-4 space-y-3"
        >
          <p className="text-sm font-medium text-ink-900">{c.title}</p>
          <p className="text-xs text-ink-600">{c.hint}</p>

          {services === null ? (
            <p className="text-xs text-ink-500">{t.common.loading}</p>
          ) : services.length === 0 ? (
            <p className="text-xs text-red-700">{c.noPrograms}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-medium text-ink-700 mb-1">{c.program}</span>
                <select value={serviceId} onChange={(e) => pickService(e.target.value)} className={inputCls}>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {s.sessions} {c.sessions} · {formatMoney(s.priceCents, s.currency)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-ink-700 mb-1">{c.price}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={inputCls}
                />
                {service && priceCents != null && priceCents !== service.priceCents && (
                  <span className="block mt-1 text-[11px] text-ink-500">
                    {c.listPrice} {formatMoney(service.priceCents, service.currency)}
                  </span>
                )}
              </label>
            </div>
          )}

          {service && (
            <div className="rounded-lg bg-white border border-cream-200 px-3 py-2 text-xs text-ink-700 space-y-0.5">
              <p>
                {c.becomes} <strong>1 / {service.sessions}</strong>
                {" · "}
                {service.sessions - 1} {c.leftToBook}
              </p>
              <p>
                {c.alreadyPaid} <strong>{formatMoney(carried, currency)}</strong>
                {balance != null && (
                  <>
                    {" · "}
                    {c.balance}{" "}
                    <strong className={balance > 0 ? "text-amber-800" : "text-brand-800"}>
                      {formatMoney(balance, currency)}
                    </strong>
                  </>
                )}
              </p>
              {priceTooLow && <p className="text-red-700">{c.priceTooLow}</p>}
            </div>
          )}

          {error && <p className="text-xs text-red-700">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!service || priceCents == null || priceTooLow || submitting}
              className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-xs font-medium px-4 py-2"
            >
              {submitting ? c.converting : c.confirm}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-ink-600 hover:text-ink-900"
            >
              {t.common.cancel}
            </button>
          </div>
        </form>
      </Collapse>
    </div>
  );
}
