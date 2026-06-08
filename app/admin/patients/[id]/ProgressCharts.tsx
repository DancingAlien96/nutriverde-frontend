"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnthropometricMeasurement } from "../../../lib/admin";

type Series = {
  key: keyof AnthropometricMeasurement;
  label: string;
  color: string;
};

const COMPOSITION_SERIES: Series[] = [
  { key: "weightKg", label: "Peso (kg)", color: "#95593a" },
  { key: "leanMassKg", label: "Masa magra (kg)", color: "#7a8c5a" },
];

const BODY_FAT_SERIES: Series[] = [
  { key: "fatPercent", label: "% grasa corporal", color: "#95593a" },
  { key: "waterPercent", label: "% agua", color: "#4f8c8e" },
  { key: "caliperFatPercent", label: "% grasa cáliper", color: "#c68c56" },
];

const CIRCUMFERENCE_SERIES: Series[] = [
  { key: "waistCm", label: "Cintura", color: "#95593a" },
  { key: "abdomenCm", label: "Abdomen", color: "#c68c56" },
  { key: "hipCm", label: "Cadera", color: "#7a8c5a" },
  { key: "chestCm", label: "Pecho", color: "#4f8c8e" },
  { key: "armCm", label: "Brazo", color: "#d7a878" },
  { key: "thighCm", label: "Muslo", color: "#74442e" },
];

type TabKey = "weight" | "fat" | "circ";

export function ProgressCharts({
  measurements,
}: {
  measurements: AnthropometricMeasurement[];
}) {
  const [tab, setTab] = useState<TabKey>("weight");

  // Recharts necesita la serie ordenada ascendente por fecha
  const data = useMemo(() => {
    return [...measurements]
      .sort(
        (a, b) =>
          new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime(),
      )
      .map((m, i) => ({
        ...m,
        label: m.visitNumber ? `#${m.visitNumber}` : `V${i + 1}`,
        date: new Date(m.measuredAt).toLocaleDateString("es-GT", {
          day: "2-digit",
          month: "short",
        }),
      }));
  }, [measurements]);

  const activeSeries =
    tab === "weight"
      ? COMPOSITION_SERIES
      : tab === "fat"
        ? BODY_FAT_SERIES
        : CIRCUMFERENCE_SERIES;

  // Filtramos solo series que tienen al menos un dato no-nulo
  const seriesWithData = activeSeries.filter((s) =>
    data.some((d) => d[s.key as keyof typeof d] != null),
  );

  if (data.length < 2) {
    return (
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Evolución</h2>
        <p className="text-sm text-gray-500">
          Necesitas al menos 2 mediciones registradas para ver gráficas de
          evolución.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="font-semibold text-gray-900">Evolución</h2>
        <div className="flex sm:inline-flex rounded-full bg-cream-100 p-1 text-xs font-medium overflow-x-auto -mx-1 sm:mx-0">
          {(
            [
              { key: "weight", label: "Peso & masa magra" },
              { key: "fat", label: "% grasa & agua" },
              { key: "circ", label: "Circunferencias" },
            ] as { key: TabKey; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap shrink-0 ${
                tab === t.key
                  ? "bg-ink-900 text-white"
                  : "text-ink-700 hover:text-ink-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {seriesWithData.length === 0 ? (
        <p className="text-sm text-gray-500">
          No hay datos para este indicador en las mediciones registradas.
        </p>
      ) : (
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece2cf" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b6052" }}
                stroke="#aa9f8e"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b6052" }}
                stroke="#aa9f8e"
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #ece2cf",
                  backgroundColor: "#fbf8f2",
                }}
                labelStyle={{ color: "#1d1812", fontWeight: 600 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
              />
              {seriesWithData.map((s) => (
                <Line
                  key={s.key as string}
                  type="monotone"
                  dataKey={s.key as string}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: s.color }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
