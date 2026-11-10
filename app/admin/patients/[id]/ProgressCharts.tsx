"use client";

import { useMemo, useState } from "react";
import { CollapsibleSection } from "../../CollapsibleSection";
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
import { useAdminT, type AdminDict } from "../../../lib/admin-i18n";

/** Indicadores graficables; la etiqueta de cada serie sale del diccionario. */
type SeriesKey = keyof AdminDict["clinical"]["progress"]["series"] &
  keyof AnthropometricMeasurement;

type Series = {
  key: SeriesKey;
  color: string;
};

const COMPOSITION_SERIES: Series[] = [
  { key: "weightKg", color: "#95593a" },
  { key: "leanMassKg", color: "#7a8c5a" },
];

const BODY_FAT_SERIES: Series[] = [
  { key: "fatPercent", color: "#95593a" },
  { key: "waterPercent", color: "#4f8c8e" },
  { key: "caliperFatPercent", color: "#c68c56" },
];

const CIRCUMFERENCE_SERIES: Series[] = [
  { key: "waistCm", color: "#95593a" },
  { key: "abdomenCm", color: "#c68c56" },
  { key: "hipCm", color: "#7a8c5a" },
  { key: "chestCm", color: "#4f8c8e" },
  { key: "armCm", color: "#d7a878" },
  { key: "thighCm", color: "#74442e" },
];

type TabKey = "weight" | "fat" | "circ";

const TABS: TabKey[] = ["weight", "fat", "circ"];

export function ProgressCharts({
  measurements,
}: {
  measurements: AnthropometricMeasurement[];
}) {
  const t = useAdminT();
  const p = t.clinical.progress;
  const dateLocale = t.dateLocale;
  const [tab, setTab] = useState<TabKey>("weight");

  // Recharts needs the series sorted ascending by date
  const data = useMemo(() => {
    return [...measurements]
      .sort(
        (a, b) =>
          new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime(),
      )
      .map((m, i) => ({
        ...m,
        label: m.visitNumber ? `#${m.visitNumber}` : `V${i + 1}`,
        date: new Date(m.measuredAt).toLocaleDateString(dateLocale, {
          day: "2-digit",
          month: "short",
        }),
      }));
  }, [measurements, dateLocale]);

  const activeSeries =
    tab === "weight"
      ? COMPOSITION_SERIES
      : tab === "fat"
        ? BODY_FAT_SERIES
        : CIRCUMFERENCE_SERIES;

  // Keep only series that have at least one non-null value
  const seriesWithData = activeSeries.filter((s) =>
    data.some((d) => d[s.key as keyof typeof d] != null),
  );

  if (data.length < 2) {
    return (
      <CollapsibleSection title={p.title} summary={p.needsTwo}>
        <p className="text-sm text-gray-500">{p.needsTwoHint}</p>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      title={p.title}
      summary={p.measurementsCount.replace("{n}", String(data.length))}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mb-4">
        <div className="flex sm:inline-flex rounded-full bg-cream-100 p-1 text-xs font-medium overflow-x-auto -mx-1 sm:mx-0">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap shrink-0 ${
                tab === key
                  ? "bg-ink-900 text-white"
                  : "text-ink-700 hover:text-ink-900"
              }`}
            >
              {p.tabs[key]}
            </button>
          ))}
        </div>
      </div>

      {seriesWithData.length === 0 ? (
        <p className="text-sm text-gray-500">{p.noData}</p>
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
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={p.series[s.key]}
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
    </CollapsibleSection>
  );
}
