"use client";

import { useEffect, useState } from "react";
import {
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  type Reminder,
} from "../lib/admin";

/**
 * Recordatorios y tareas. Persisten en el backend (tabla `reminders`), por lo
 * que se sincronizan entre dispositivos y no se pierden al limpiar el navegador.
 */
export function Reminders() {
  const [tasks, setTasks] = useState<Reminder[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  // ids con una operación en curso (para deshabilitar mientras responde)
  const [busy, setBusy] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    listReminders()
      .then(({ reminders }) => {
        if (!cancelled) setTasks(reminders);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function markBusy(id: string, on: boolean) {
    setBusy((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t || adding) return;
    setAdding(true);
    setError(null);
    try {
      const { reminder } = await createReminder(t);
      setTasks((prev) => [reminder, ...prev]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add task.");
    } finally {
      setAdding(false);
    }
  }

  async function toggle(task: Reminder) {
    markBusy(task.id, true);
    // Optimista
    const prevTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)),
    );
    try {
      await updateReminder(task.id, { done: !task.done });
    } catch (err) {
      setTasks(prevTasks); // revertir
      setError(err instanceof Error ? err.message : "Couldn't update.");
    } finally {
      markBusy(task.id, false);
    }
  }

  async function remove(id: string) {
    markBusy(id, true);
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteReminder(id);
    } catch (err) {
      setTasks(prevTasks);
      setError(err instanceof Error ? err.message : "Couldn't delete.");
    } finally {
      markBusy(id, false);
    }
  }

  return (
    <div className="rounded-3xl bg-white border border-cream-200 p-5 h-full flex flex-col">
      <h2 className="text-xs uppercase tracking-wider font-semibold text-ink-500 mb-3">
        Reminders &amp; tasks
      </h2>

      {error && (
        <p className="mb-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-400 py-4 text-center">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-ink-400 py-4 text-center">
          No pending tasks. Add one below.
        </p>
      ) : (
        <ul className="space-y-1 mb-3 overflow-y-auto">
          {tasks.map((t) => {
            const isBusy = busy.has(t.id);
            return (
              <li
                key={t.id}
                className={`group flex items-center gap-3 py-2 border-b border-cream-100 last:border-0 ${
                  isBusy ? "opacity-60" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(t)}
                  disabled={isBusy}
                  aria-label={t.done ? "Mark as pending" : "Mark as done"}
                  className={`h-5 w-5 shrink-0 rounded-md border flex items-center justify-center transition-colors ${
                    t.done
                      ? "bg-brand-400 border-brand-400 text-white"
                      : "border-cream-300 hover:border-brand-400"
                  }`}
                >
                  {t.done && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    t.done ? "text-ink-400 line-through" : "text-ink-800"
                  }`}
                >
                  {t.text}
                </span>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  disabled={isBusy}
                  aria-label="Delete"
                  className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-red-500 transition-opacity"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleAdd} className="mt-auto flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New task…"
          maxLength={500}
          className="flex-1 rounded-full border border-cream-200 bg-cream-50 px-4 py-2 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-400"
        />
        <button
          type="submit"
          disabled={adding || !text.trim()}
          className="shrink-0 rounded-full bg-brand-400 hover:bg-brand-500 disabled:opacity-50 text-white h-9 w-9 flex items-center justify-center transition-colors"
          aria-label="Add task"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </form>
    </div>
  );
}
