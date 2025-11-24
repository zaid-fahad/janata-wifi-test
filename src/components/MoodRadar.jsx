import { useMemo, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function MoodRadar({ allRows }) {
  const [selectedCode, setSelectedCode] = useState("");

  // Extract unique trade codes
  const tradeCodes = useMemo(() => {
    return [...new Set(allRows.map((r) => r.trade_code))];
  }, [allRows]);

  // Compute averages
  const radarData = useMemo(() => {
    let rows = selectedCode
      ? allRows.filter((r) => r.trade_code === selectedCode)
      : allRows;

    if (rows.length === 0) return [];

    const avg = (key) =>
      rows.reduce((sum, r) => sum + Number(r[key]), 0) / rows.length;

    const avgHigh = avg("high");
    const avgLow = avg("low");
    const avgVolume = avg("volume");
    const avgVolatility = rows.reduce((sum, r) => sum + (r.high - r.low), 0) / rows.length;

    return [
      { metric: "Avg High", value: avgHigh },
      { metric: "Avg Low", value: avgLow },
      { metric: "Avg Volume", value: avgVolume },
      { metric: "Avg Volatility", value: avgVolatility },
    ];
  }, [allRows, selectedCode]);

  return (
    <div className="p-6 bg-white rounded-xl shadow mb-8">
      <h2 className="text-xl font-semibold mb-4">Market Mood Radar</h2>

      {/* Dropdown */}
      <select
        className="border px-3 py-2 rounded mb-4"
        value={selectedCode}
        onChange={(e) => setSelectedCode(e.target.value)}
      >
        <option value="">All Trade Codes</option>
        {tradeCodes.map((code) => (
          <option key={code} value={code}>{code}</option>
        ))}
      </select>

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#d1d5db" />

            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={30} />

            <Tooltip />

            <Radar
              name="Market Mood"
              dataKey="value"
              stroke="#2563eb"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
