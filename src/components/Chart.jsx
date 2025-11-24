import { useMemo, useState } from "react";
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  ResponsiveContainer,
} from "recharts";

export default function StockChart({ allRows }) {
  const [selectedCode, setSelectedCode] = useState("");

  const loading = allRows.length === 0;

  // ---- Pre-process all data ONCE ----
  const processed = useMemo(() => {
    return allRows.map((d) => ({
      ...d,
      dateObj: new Date(d.date),
      dateStr: d.date,
    }));
  }, [allRows]);

  // ---- Extract unique trade codes ----
  const tradeCodes = useMemo(() => {
    return Array.from(new Set(processed.map((r) => r.trade_code))).sort();
  }, [processed]);

  // ---- Filter + Sort ----
  const chartData = useMemo(() => {
    let filtered = selectedCode
      ? processed.filter((r) => r.trade_code === selectedCode)
      : processed;

    return [...filtered].sort((a, b) => a.dateObj - b.dateObj);
  }, [processed, selectedCode]);

  return (
    <div className="p-6 bg-white rounded-xl shadow mb-8 border border-gray-200 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Stock Chart</h2>

        <select
          className="px-3 py-2 border rounded-lg bg-gray-50 text-sm"
          value={selectedCode}
          onChange={(e) => setSelectedCode(e.target.value)}
        >
          <option value="">All Trade Codes</option>
          {tradeCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

      {/* ⭐ Shimmer Skeleton Loader */}
      {loading && (
        <div className="w-full h-96 rounded-lg overflow-hidden relative">
          {/* Horizontal shimmer bars */}
          <div className="absolute inset-0 flex flex-col justify-between py-6 px-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-full bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>

          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.3s_infinite]"></div>

          {/* Keyframes */}
          <style>
            {`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}
          </style>
        </div>
      )}

      {/* Chart */}
      {!loading && (
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />

              <XAxis dataKey="dateStr" tick={{ fontSize: 12 }} minTickGap={20} />

              <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#2563eb" />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                stroke="#10b981"
              />

              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="close"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                animationDuration={400}
              />

              <Bar
                yAxisId="right"
                dataKey="volume"
                fill="#10b981"
                opacity={0.7}
                barSize={22}
                animationDuration={400}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
