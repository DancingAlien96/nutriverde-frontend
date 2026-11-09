"use client";

import { createContext, useContext, useId, useState } from "react";
import { Collapse } from "./Collapse";
import { ChevronDownIcon } from "./icons";

/**
 * Tarjetas de sección que se despliegan hacia abajo (expediente de la
 * paciente). Dentro de un SectionsProvider recuerdan en el navegador cuáles
 * quedaron abiertas, y se pueden abrir o cerrar todas a la vez.
 */

interface Stored {
  /** Última orden de "abrir todo" / "cerrar todo"; null si no hubo. */
  all: boolean | null;
  /** Secciones que la persona abrió o cerró a mano después de esa orden. */
  map: Record<string, boolean>;
}

interface SectionsApi {
  isOpen: (id: string, fallback: boolean) => boolean;
  toggle: (id: string, fallback: boolean) => void;
  setAll: (open: boolean) => void;
}

const SectionsContext = createContext<SectionsApi | null>(null);

function readStored(key: string): Stored {
  const empty: Stored = { all: null, map: {} };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return empty;
    const v = JSON.parse(raw) as { all?: unknown; map?: unknown };
    const map: Record<string, boolean> = {};
    if (v.map && typeof v.map === "object") {
      for (const [k, val] of Object.entries(v.map as Record<string, unknown>)) {
        if (typeof val === "boolean") map[k] = val;
      }
    }
    return { all: typeof v.all === "boolean" ? v.all : null, map };
  } catch {
    return empty;
  }
}

export function SectionsProvider({
  storageKey,
  children,
}: {
  storageKey: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<Stored>(() => readStored(storageKey));

  function commit(next: Stored) {
    setState(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Sin almacenamiento (modo privado): vale solo mientras dure la página.
    }
  }

  const api: SectionsApi = {
    isOpen: (id, fallback) => state.map[id] ?? state.all ?? fallback,
    toggle: (id, fallback) => {
      const current = state.map[id] ?? state.all ?? fallback;
      commit({ ...state, map: { ...state.map, [id]: !current } });
    },
    setAll: (open) => commit({ all: open, map: {} }),
  };

  return <SectionsContext.Provider value={api}>{children}</SectionsContext.Provider>;
}

/** Botones "abrir todo" / "cerrar todo". Solo funciona dentro del provider. */
export function SectionsToolbar({
  expandLabel,
  collapseLabel,
}: {
  expandLabel: string;
  collapseLabel: string;
}) {
  const api = useContext(SectionsContext);
  if (!api) return null;
  const btn =
    "text-xs font-medium text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline";
  return (
    <div className="mb-3 flex items-center justify-end gap-4">
      <button type="button" onClick={() => api.setAll(true)} className={btn}>
        {expandLabel}
      </button>
      <button type="button" onClick={() => api.setAll(false)} className={btn}>
        {collapseLabel}
      </button>
    </div>
  );
}

export function CollapsibleSection({
  id,
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  /** Identificador estable para recordar el estado; por defecto, el título. */
  id?: string;
  title: string;
  /** Texto corto a la derecha del título (p. ej. cuántos registros hay). */
  summary?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const api = useContext(SectionsContext);
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const panelId = useId();
  const key = id ?? title;
  const open = api ? api.isOpen(key, defaultOpen) : localOpen;

  function toggle() {
    if (api) api.toggle(key, defaultOpen);
    else setLocalOpen((v) => !v);
  }

  return (
    <section className="bg-white border border-gray-200 rounded-2xl mb-6">
      <h2>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full flex items-center justify-between gap-3 rounded-2xl px-5 sm:px-6 py-4 text-left hover:bg-gray-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <span className="font-semibold text-gray-900">{title}</span>
          <span className="flex items-center gap-3 min-w-0">
            {summary != null && summary !== "" && (
              <span className="text-xs font-normal text-gray-500 text-right">{summary}</span>
            )}
            <ChevronDownIcon
              className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-300 motion-reduce:transition-none ${
                open ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>
      </h2>
      <Collapse open={open}>
        <div id={panelId} className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1">
          {children}
        </div>
      </Collapse>
    </section>
  );
}
