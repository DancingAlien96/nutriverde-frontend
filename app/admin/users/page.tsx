"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell";
import {
  adminMe,
  createAdminUser,
  listAdminUsers,
  updateAdminUser,
  type AdminLocale,
  type AdminRole,
  type AdminUserItem,
} from "../../lib/admin";
import { useAdminT } from "../../lib/admin-i18n";

const ROLES: AdminRole[] = ["NUTRITIONIST", "STAFF", "SECRETARY"];
const LOCALES: AdminLocale[] = ["EN", "ES"];

export default function UsersPage() {
  return (
    <AdminShell>
      <UsersContent />
    </AdminShell>
  );
}

function UsersContent() {
  const t = useAdminT();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function reload() {
    const { users: list } = await listAdminUsers();
    setUsers(list);
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([listAdminUsers(), adminMe()])
      .then(([u, me]) => {
        if (cancelled) return;
        setUsers(u.users);
        setMeId(me.admin.id);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl text-ink-900">{t.users.title}</h1>
          <p className="text-sm text-ink-600 mt-1">{t.users.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className={`rounded-full px-4 h-9 text-sm font-medium self-start sm:self-auto transition-colors ${
            showCreate
              ? "border border-cream-200 bg-white text-ink-700 hover:bg-cream-50"
              : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
        >
          {showCreate ? t.common.cancel : t.users.newUser}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showCreate && (
        <CreateUserForm
          onCreated={async () => {
            setShowCreate(false);
            await reload();
          }}
        />
      )}

      {loading ? (
        <div className="text-sm text-ink-500">{t.common.loading}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-cream-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">{t.users.colUser}</th>
                <th className="text-left px-4 py-3 font-medium">{t.users.colRole}</th>
                <th className="text-left px-4 py-3 font-medium">{t.users.colLanguage}</th>
                <th className="text-left px-4 py-3 font-medium">{t.users.colStatus}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow key={u.id} user={u} isMe={u.id === meId} onChanged={reload} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function UserRow({
  user,
  isMe,
  onChanged,
}: {
  user: AdminUserItem;
  isMe: boolean;
  onChanged: () => Promise<void>;
}) {
  const t = useAdminT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  // Edición de nombre y correo (formulario en línea bajo la fila).
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(user.fullName);
  const [draftEmail, setDraftEmail] = useState(user.email);

  async function patch(data: Parameters<typeof updateAdminUser>[1]) {
    setBusy(true);
    setError(null);
    try {
      await updateAdminUser(user.id, data);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive() {
    const verb = user.active ? t.users.deactivate : t.users.reactivate;
    const extra = user.active ? ` ${t.users.confirmDeactivate}` : "";
    if (!confirm(`${verb} ${user.fullName}${t.users.confirmQuestion}${extra}`)) return;
    await patch({ active: !user.active });
  }

  async function savePassword() {
    if (newPassword.length < 10) {
      setError(t.users.passwordShort);
      return;
    }
    await patch({ password: newPassword });
    setNewPassword("");
    setShowPassword(false);
  }

  function openEdit() {
    setDraftName(user.fullName);
    setDraftEmail(user.email);
    setShowPassword(false);
    setError(null);
    setEditing((v) => !v);
  }

  const detailsChanged =
    draftName.trim() !== user.fullName || draftEmail.trim().toLowerCase() !== user.email;
  const canSaveDetails =
    detailsChanged && draftName.trim().length >= 2 && draftEmail.includes("@") && !busy;

  async function saveDetails() {
    const data: Parameters<typeof updateAdminUser>[1] = {};
    if (draftName.trim() !== user.fullName) data.fullName = draftName.trim();
    if (draftEmail.trim().toLowerCase() !== user.email) data.email = draftEmail.trim().toLowerCase();
    await patch(data);
    setEditing(false);
  }

  const selectCls =
    "rounded-lg border border-cream-200 bg-white px-2 py-1.5 text-xs disabled:opacity-60";

  return (
    <>
      <tr className={`border-t border-cream-100 ${user.active ? "" : "opacity-60"}`}>
        <td className="px-4 py-3">
          <div className="font-medium text-ink-900">
            {user.fullName}
            {isMe && (
              <span className="ml-2 text-[10px] uppercase tracking-wider text-brand-700">
                {t.common.you}
              </span>
            )}
          </div>
          <div className="text-xs text-ink-500">{user.email}</div>
        </td>
        <td className="px-4 py-3">
          <select
            value={user.role}
            disabled={busy || isMe}
            onChange={(e) => patch({ role: e.target.value as AdminRole })}
            className={selectCls}
            title={isMe ? t.users.ownRole : t.users.roleHint[user.role]}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {t.roles[r]}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3">
          <select
            value={user.locale}
            disabled={busy}
            onChange={(e) => patch({ locale: e.target.value as AdminLocale })}
            className={selectCls}
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {t.users.locales[l]}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              user.active ? "bg-brand-100 text-brand-800" : "bg-cream-100 text-ink-500"
            }`}
          >
            {user.active ? t.users.active : t.users.inactive}
          </span>
        </td>
        <td className="px-4 py-3 text-right whitespace-nowrap">
          <button
            type="button"
            onClick={openEdit}
            disabled={busy}
            className="text-xs font-medium text-brand-700 hover:text-brand-800 mr-3"
          >
            {editing ? t.common.close : t.users.edit}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowPassword((v) => !v);
              setEditing(false);
              setError(null);
            }}
            disabled={busy}
            className="text-xs font-medium text-ink-600 hover:text-ink-900 mr-3"
          >
            {showPassword ? t.common.close : t.users.changePassword}
          </button>
          {!isMe && (
            <button
              type="button"
              onClick={toggleActive}
              disabled={busy}
              className={`text-xs font-medium ${
                user.active ? "text-red-700 hover:text-red-800" : "text-brand-700 hover:text-brand-800"
              }`}
            >
              {user.active ? t.users.deactivate : t.users.reactivate}
            </button>
          )}
        </td>
      </tr>
      {(editing || showPassword || error) && (
        <tr className="border-t border-cream-50 bg-cream-50/50">
          <td colSpan={5} className="px-4 py-3">
            {editing && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-2">
                  {t.users.editTitle}
                </p>
                <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 items-end max-w-2xl">
                  <label className="block">
                    <span className="block text-xs text-ink-600 mb-1">{t.users.fullName}</span>
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs text-ink-600 mb-1">{t.users.email}</span>
                    <input
                      type="email"
                      value={draftEmail}
                      onChange={(e) => setDraftEmail(e.target.value)}
                      autoComplete="off"
                      className={inputCls}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={saveDetails}
                    disabled={!canSaveDetails}
                    className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-medium px-4 py-2.5"
                  >
                    {busy ? t.users.saving : t.users.save}
                  </button>
                </div>
              </div>
            )}
            {showPassword && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.users.newPasswordPh}
                  autoComplete="new-password"
                  className="flex-1 max-w-sm rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={savePassword}
                  disabled={busy || newPassword.length < 10}
                  className="rounded-full bg-ink-900 hover:bg-ink-800 disabled:opacity-40 text-white text-xs font-medium px-4 py-2"
                >
                  {busy ? t.users.saving : t.users.savePassword}
                </button>
              </div>
            )}
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </td>
        </tr>
      )}
    </>
  );
}

function CreateUserForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const t = useAdminT();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("SECRETARY");
  const [locale, setLocale] = useState<AdminLocale>("ES");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    fullName.trim().length >= 2 && email.includes("@") && password.length >= 10 && !submitting;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await createAdminUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        locale,
      });
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-5 rounded-3xl bg-white border border-brand-200 p-5">
      <h2 className="text-xs uppercase tracking-wider font-semibold text-brand-700">
        {t.users.formTitle}
      </h2>
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <Field label={t.users.fullName}>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label={t.users.email}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            className={inputCls}
          />
        </Field>
        <Field label={t.users.password}>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className={inputCls}
          />
        </Field>
        <Field label={t.users.role} hint={t.users.roleHint[role]}>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            className={inputCls}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {t.roles[r]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.users.language}>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as AdminLocale)}
            className={inputCls}
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {t.users.locales[l]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5"
        >
          {submitting ? t.users.creating : t.users.create}
        </button>
        <span className="text-xs text-ink-500">{t.users.shareHint}</span>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-ink-600 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-ink-500 mt-1">{hint}</span>}
    </label>
  );
}
