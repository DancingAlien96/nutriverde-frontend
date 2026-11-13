"use client";

import { useState } from "react";
import {
  addChargePayment,
  centsToInput,
  createCharge,
  deleteChargePayment,
  formatMoney,
  parseMoney,
  updateCharge,
  type ChargeMethod,
  type ChargePlan,
  type ChargeStatus,
  type ChargeSummary,
} from "../lib/admin";
import { useAdminT } from "../lib/admin-i18n";
import { Collapse } from "./Collapse";
import { ChevronDownIcon } from "./icons";

const METHODS: ChargeMethod[] = ["CASH", "TRANSFER", "CARD", "OTHER"];

const STATUS_CHIP: Record<ChargeStatus, string> = {
  PAID: "bg-brand-100 text-brand-800",
  PARTIAL: "bg-amber-100 text-amber-800",
  PENDING: "bg-red-50 text-red-700",
};

const inputCls =
  "w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

// ============================================================
// Campos de precio y forma de pago (Nueva cita y "Registrar cobro")
// ============================================================

/** Plan del formulario: ademas de los del cobro, "LATER" = hoy no paga nada
 *  (la consulta inicial se agenda sin pago y se cobra al salir). Se guarda
 *  como INSTALLMENTS con abono 0. */
export type ChargeFieldsPlan = ChargePlan | "LATER";

/** Plan que se manda al servidor a partir del plan del formulario. */
export function toChargePlan(plan: ChargeFieldsPlan): ChargePlan {
  return plan === "LATER" ? "INSTALLMENTS" : plan;
}

export interface ChargeFieldsValue {
  /** null = usar el precio de lista del servicio. */
  priceText: string | null;
  plan: ChargeFieldsPlan;
  /** Abono de hoy cuando paga por plazos. Vacío = nada todavía. */
  paidText: string;
  method: ChargeMethod;
}

export const EMPTY_CHARGE_FIELDS: ChargeFieldsValue = {
  priceText: null,
  plan: "FULL",
  paidText: "",
  method: "CASH",
};

/** Convierte lo escrito en montos y dice qué campo está mal, si alguno. */
export function resolveChargeFields(
  value: ChargeFieldsValue,
  listPriceCents: number,
): {
  priceCents: number | null;
  paidCents: number | null;
  error: "price" | "paid" | null;
} {
  const priceCents =
    value.priceText === null ? listPriceCents : parseMoney(value.priceText);
  if (priceCents === null) return { priceCents: null, paidCents: null, error: "price" };
  if (value.plan === "FULL") return { priceCents, paidCents: priceCents, error: null };
  if (value.plan === "LATER") return { priceCents, paidCents: 0, error: null };
  const paidCents = value.paidText.trim() === "" ? 0 : parseMoney(value.paidText);
  if (paidCents === null || paidCents > priceCents) {
    return { priceCents, paidCents: null, error: "paid" };
  }
  return { priceCents, paidCents, error: null };
}

export function ChargeFields({
  value,
  onChange,
  listPriceCents,
  currency,
}: {
  value: ChargeFieldsValue;
  onChange: (next: ChargeFieldsValue) => void;
  listPriceCents: number;
  currency: string;
}) {
  const t = useAdminT();
  const { priceCents, paidCents, error } = resolveChargeFields(value, listPriceCents);
  const diff = priceCents === null ? 0 : listPriceCents - priceCents;
  const symbol = currency === "GTQ" ? "Q" : currency === "USD" ? "US$" : currency;

  const planBtn = (plan: ChargeFieldsPlan, text: string) => (
    <button
      type="button"
      onClick={() => onChange({ ...value, plan })}
      aria-pressed={value.plan === plan}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        value.plan === plan ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-cream-50"
      }`}
    >
      {text}
    </button>
  );

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="block text-xs text-ink-600 mb-1">{t.charge.price}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-500">{symbol}</span>
          <input
            type="text"
            inputMode="decimal"
            value={value.priceText ?? centsToInput(listPriceCents)}
            onChange={(e) => onChange({ ...value, priceText: e.target.value })}
            className={`${inputCls} max-w-[9rem] tabular-nums ${error === "price" ? "border-red-300" : ""}`}
          />
        </div>
        <span className="mt-1 block text-[11px] text-ink-500">
          {t.charge.listPrice}: {formatMoney(listPriceCents, currency)}
          {priceCents !== null && diff > 0 && (
            <span className="text-brand-700 font-medium">
              {" · "}
              {t.charge.discount} {formatMoney(diff, currency)}
            </span>
          )}
          {priceCents !== null && diff < 0 && (
            <span className="text-amber-700 font-medium">
              {" · "}
              {formatMoney(-diff, currency)} {t.charge.surcharge}
            </span>
          )}
          {value.priceText !== null && diff !== 0 && (
            <>
              {" · "}
              <button
                type="button"
                onClick={() => onChange({ ...value, priceText: null })}
                className="underline underline-offset-2 hover:text-ink-700"
              >
                {t.charge.useList}
              </button>
            </>
          )}
        </span>
        {error === "price" && (
          <span className="mt-1 block text-[11px] text-red-600">{t.charge.invalidPrice}</span>
        )}
      </label>

      <div className="inline-flex flex-wrap rounded-full bg-white border border-cream-200 p-1">
        {planBtn("LATER", t.charge.payLater)}
        {planBtn("FULL", t.charge.paidFull)}
        {planBtn("INSTALLMENTS", t.charge.installments)}
      </div>

      {value.plan === "LATER" && <p className="text-[11px] text-ink-500">{t.charge.laterNote}</p>}

      {value.plan === "FULL" && priceCents !== null && (
        <p className="text-[11px] text-ink-500">
          {t.charge.fullNote}{" "}
          <span className="font-medium text-ink-700">{formatMoney(priceCents, currency)}</span>
        </p>
      )}

      {value.plan === "INSTALLMENTS" && (
        <label className="block">
          <span className="block text-xs text-ink-600 mb-1">{t.charge.paidToday}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-500">{symbol}</span>
            <input
              type="text"
              inputMode="decimal"
              value={value.paidText}
              placeholder="0"
              onChange={(e) => onChange({ ...value, paidText: e.target.value })}
              className={`${inputCls} max-w-[9rem] tabular-nums ${error === "paid" ? "border-red-300" : ""}`}
            />
          </div>
          {error === "paid" ? (
            <span className="mt-1 block text-[11px] text-red-600">{t.charge.invalidPaid}</span>
          ) : (
            <span className="mt-1 block text-[11px] text-ink-500">
              {priceCents !== null && paidCents !== null ? (
                <>
                  {t.charge.balanceAfter}{" "}
                  <span className="font-medium text-ink-700">
                    {formatMoney(priceCents - paidCents, currency)}
                  </span>
                  {paidCents === 0 ? ` · ${t.charge.paidTodayHint}` : ""}
                </>
              ) : (
                t.charge.paidTodayHint
              )}
            </span>
          )}
        </label>
      )}

      {(paidCents ?? 0) > 0 && (
        <label className="block">
          <span className="block text-xs text-ink-600 mb-1">{t.charge.method}</span>
          <select
            value={value.method}
            onChange={(e) => onChange({ ...value, method: e.target.value as ChargeMethod })}
            className={`${inputCls} max-w-[12rem]`}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {t.charge.methods[m]}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

// ============================================================
// Panel del cobro: estado, abonos y registro de un abono nuevo
// ============================================================

export function ChargeStatusChip({ charge }: { charge: ChargeSummary }) {
  const t = useAdminT();
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CHIP[charge.status]}`}
    >
      {t.charge.status[charge.status]}
    </span>
  );
}

export function ChargePanel({
  charge,
  target,
  listPriceCents,
  currency = "GTQ",
  canManage,
  onChanged,
  defaultOpen = false,
  title,
}: {
  charge: ChargeSummary | null;
  /** A qué se le registra el cobro si todavía no existe. */
  target: { appointmentId?: string; packageId?: string };
  /** Precio de lista del servicio, para proponerlo al registrar el cobro. */
  listPriceCents?: number;
  currency?: string;
  /** Nutricionista/staff: puede corregir el precio y borrar abonos. */
  canManage: boolean;
  onChanged: () => void;
  defaultOpen?: boolean;
  title?: string;
}) {
  const t = useAdminT();
  const [open, setOpen] = useState(defaultOpen);

  if (!charge) {
    return (
      <RegisterCharge
        target={target}
        listPriceCents={listPriceCents ?? 0}
        currency={currency}
        onChanged={onChanged}
        title={title ?? t.charge.title}
      />
    );
  }

  const heading = title ?? (charge.scope === "PACKAGE" ? t.charge.packageTitle : t.charge.title);

  return (
    <div className="mt-2 rounded-xl border border-cream-200 bg-cream-50/60 px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          {heading}
        </span>
        <ChargeStatusChip charge={charge} />
      </div>
      <div className="mt-1 flex items-start justify-between gap-3">
        <p className="text-xs text-ink-700 tabular-nums">
          {t.charge.paid} {formatMoney(charge.paidCents, charge.currency)} {t.charge.of}{" "}
          {formatMoney(charge.priceCents, charge.currency)}
          {charge.balanceCents > 0 && (
            <span className="font-semibold text-amber-800">
              {" · "}
              {t.charge.balance} {formatMoney(charge.balanceCents, charge.currency)}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 hover:text-brand-800"
        >
          {open ? t.charge.hide : t.charge.show}
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform duration-300 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Se despliega hacia abajo con los abonos y las acciones. */}
      <Collapse open={open}>
        <ChargeDetail charge={charge} canManage={canManage} onChanged={onChanged} />
      </Collapse>
    </div>
  );
}

function ChargeDetail({
  charge,
  canManage,
  onChanged,
}: {
  charge: ChargeSummary;
  canManage: boolean;
  onChanged: () => void;
}) {
  const t = useAdminT();
  const [mode, setMode] = useState<"idle" | "pay" | "price">("idle");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function removePayment(paymentId: string) {
    if (!window.confirm(t.charge.confirmDelete)) return;
    setBusyId(paymentId);
    setError(null);
    try {
      await deleteChargePayment(charge.id, paymentId);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-2 border-t border-cream-200 pt-2">
      <p className="text-[11px] text-ink-500">
        {t.charge.plan[charge.plan]}
        {charge.priceCents !== charge.listPriceCents && (
          <>
            {" · "}
            {t.charge.listPrice} {formatMoney(charge.listPriceCents, charge.currency)}
          </>
        )}
      </p>

      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        {t.charge.payments}
      </p>
      {charge.payments.length === 0 ? (
        <p className="mt-1 text-xs text-ink-500">{t.charge.noPayments}</p>
      ) : (
        <ul className="mt-1 divide-y divide-cream-200">
          {charge.payments.map((p) => (
            <li key={p.id} className="py-1.5 flex items-start gap-2 text-xs">
              <div className="min-w-0 flex-1">
                <p className="text-ink-800 tabular-nums">
                  <span className="font-medium">{formatMoney(p.amountCents, charge.currency)}</span>
                  {" · "}
                  {t.charge.methods[p.method]}
                  {" · "}
                  {fmtDay(p.paidAt, t.dateLocale)}
                </p>
                {(p.note || p.recordedByEmail) && (
                  <p className="text-[11px] text-ink-500 break-words">
                    {[p.note, p.recordedByEmail].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              {canManage && (
                <button
                  type="button"
                  disabled={busyId === p.id}
                  onClick={() => removePayment(p.id)}
                  className="shrink-0 text-[11px] text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {t.charge.deletePayment}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}

      {mode === "idle" && (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {charge.balanceCents > 0 && (
            <button
              type="button"
              onClick={() => setMode("pay")}
              className="rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-3 py-1.5"
            >
              {t.charge.addPayment}
            </button>
          )}
          {canManage && (
            <button
              type="button"
              onClick={() => setMode("price")}
              className="text-xs font-medium text-ink-600 hover:text-ink-800"
            >
              {t.charge.editPrice}
            </button>
          )}
        </div>
      )}

      {mode === "pay" && (
        <PaymentForm
          charge={charge}
          onCancel={() => setMode("idle")}
          onSaved={() => {
            setMode("idle");
            onChanged();
          }}
        />
      )}

      {mode === "price" && (
        <PriceForm
          charge={charge}
          onCancel={() => setMode("idle")}
          onSaved={() => {
            setMode("idle");
            onChanged();
          }}
        />
      )}
    </div>
  );
}

/** Abono nuevo: propone el saldo completo, que es lo más frecuente. */
function PaymentForm({
  charge,
  onCancel,
  onSaved,
}: {
  charge: ChargeSummary;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const t = useAdminT();
  const [amount, setAmount] = useState(() => centsToInput(charge.balanceCents));
  const [method, setMethod] = useState<ChargeMethod>("CASH");
  const [date, setDate] = useState(() => todayInput());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const cents = parseMoney(amount);
    if (cents === null || cents <= 0 || cents > charge.balanceCents) {
      setError(t.charge.invalidAmount);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addChargePayment(charge.id, {
        amountCents: cents,
        method,
        paidAt: dateInputToIso(date),
        note: note.trim() || undefined,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 rounded-xl border border-cream-200 bg-white p-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="block text-[11px] text-ink-600 mb-1">{t.charge.amount}</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${inputCls} tabular-nums`}
          />
        </label>
        <label className="block">
          <span className="block text-[11px] text-ink-600 mb-1">{t.charge.method}</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as ChargeMethod)}
            className={inputCls}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {t.charge.methods[m]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-[11px] text-ink-600 mb-1">{t.charge.date}</span>
          <input
            type="date"
            value={date}
            max={todayInput()}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="block text-[11px] text-ink-600 mb-1">{t.charge.note}</span>
          <input
            type="text"
            value={note}
            maxLength={300}
            onChange={(e) => setNote(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>
      <p className="mt-2 text-[11px] text-ink-500">
        {t.charge.balance}: {formatMoney(charge.balanceCents, charge.currency)}
      </p>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
      <FormButtons
        saving={saving}
        onSubmit={submit}
        onCancel={onCancel}
        submitLabel={t.charge.addPayment}
      />
    </div>
  );
}

function PriceForm({
  charge,
  onCancel,
  onSaved,
}: {
  charge: ChargeSummary;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const t = useAdminT();
  const [price, setPrice] = useState(() => centsToInput(charge.priceCents));
  const [plan, setPlan] = useState<ChargePlan>(charge.plan);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const cents = parseMoney(price);
    if (cents === null) {
      setError(t.charge.invalidPrice);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateCharge(charge.id, { priceCents: cents, plan });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 rounded-xl border border-cream-200 bg-white p-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="block text-[11px] text-ink-600 mb-1">{t.charge.newPrice}</span>
          <input
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`${inputCls} tabular-nums`}
          />
        </label>
        <label className="block">
          <span className="block text-[11px] text-ink-600 mb-1">{t.charge.formTitle}</span>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as ChargePlan)}
            className={inputCls}
          >
            <option value="FULL">{t.charge.plan.FULL}</option>
            <option value="INSTALLMENTS">{t.charge.plan.INSTALLMENTS}</option>
          </select>
        </label>
      </div>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
      <FormButtons saving={saving} onSubmit={submit} onCancel={onCancel} submitLabel={t.charge.save} />
    </div>
  );
}

/** Cita o paquete que todavía no tiene cobro: permite registrarlo. */
function RegisterCharge({
  target,
  listPriceCents,
  currency,
  onChanged,
  title,
}: {
  target: { appointmentId?: string; packageId?: string };
  listPriceCents: number;
  currency: string;
  onChanged: () => void;
  title: string;
}) {
  const t = useAdminT();
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<ChargeFieldsValue>(EMPTY_CHARGE_FIELDS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolved = resolveChargeFields(fields, listPriceCents);

  async function submit() {
    if (resolved.error || resolved.priceCents === null || resolved.paidCents === null) return;
    setSaving(true);
    setError(null);
    try {
      await createCharge({
        ...target,
        priceCents: resolved.priceCents,
        plan: toChargePlan(fields.plan),
        paidCents: resolved.paidCents,
        method: fields.method,
      });
      setOpen(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 rounded-xl border border-dashed border-cream-200 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          {title}
        </span>
        <span className="text-[11px] text-ink-500">{t.charge.noCharge}</span>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ml-auto text-[11px] font-medium text-brand-700 hover:text-brand-800"
          >
            {t.charge.register}
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2">
          <ChargeFields
            value={fields}
            onChange={setFields}
            listPriceCents={listPriceCents}
            currency={currency}
          />
          {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
          <FormButtons
            saving={saving}
            disabled={!!resolved.error}
            onSubmit={submit}
            onCancel={() => setOpen(false)}
            submitLabel={t.charge.registerSubmit}
          />
        </div>
      )}
    </div>
  );
}

function FormButtons({
  saving,
  disabled,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  saving: boolean;
  disabled?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const t = useAdminT();
  return (
    <div className="mt-2 flex items-center gap-3">
      <button
        type="button"
        onClick={onSubmit}
        disabled={saving || disabled}
        className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5"
      >
        {saving ? t.charge.saving : submitLabel}
      </button>
      <button type="button" onClick={onCancel} className="text-xs text-ink-500 hover:text-ink-700">
        {t.common.cancel}
      </button>
    </div>
  );
}

/* Helpers de fecha */

/** Hoy en formato de <input type="date"> (fecha local del navegador). */
function todayInput(): string {
  const n = new Date();
  const mm = String(n.getMonth() + 1).padStart(2, "0");
  const dd = String(n.getDate()).padStart(2, "0");
  return `${n.getFullYear()}-${mm}-${dd}`;
}

/** Hoy se guarda con la hora actual; otro día, a mediodía local. */
function dateInputToIso(date: string): string | undefined {
  if (!date || date === todayInput()) return undefined;
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0).toISOString();
}

function fmtDay(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    timeZone: "America/Guatemala",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
