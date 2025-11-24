import { useMemo, useState } from "react";

export default function HeatmapBar({ allRows }) {
  const BATCH = 10;
  const [visibleCount, setVisibleCount] = useState(BATCH);

  // --- Aggregate avg close per trade_code ---
  const aggregated = useMemo(() => {
    const map = new Map();

    allRows.forEach((row) => {
      if (!map.has(row.trade_code)) {
        map.set(row.trade_code, []);
      }
      map.get(row.trade_code).push(Number(row.close));
    });

    const result = [...map.entries()].map(([code, arr]) => ({
      trade_code: code,
      avg_close: arr.reduce((a, b) => a + b, 0) / arr.length,
    }));

    // sort highest avg first
    return result.sort((a, b) => b.avg_close - a.avg_close);
  }, [allRows]);

  const visibleData = aggregated.slice(0, visibleCount);

  // ---- Color scale (dynamic based on min/max) ----
  const max = Math.max(...aggregated.map((d) => d.avg_close));
  const min = Math.min(...aggregated.map((d) => d.avg_close));

  const getColor = (value) => {
    const ratio = (value - min) / (max - min + 0.0001);
    const red = Math.floor(255 * ratio);
    const green = Math.floor(255 * (1 - ratio));
    return `rgb(${red}, ${green}, 80)`;
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow mb-8">
      <h2 className="text-xl font-semibold mb-4">Heatmap — Avg Close Price</h2>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-5 gap-3">
        {visibleData.map((item) => (
          <div
            key={item.trade_code}
            className="p-4 rounded-lg shadow text-white font-semibold flex flex-col items-center justify-center"
            style={{
              backgroundColor: getColor(item.avg_close),
            }}
          >
            <span>{item.trade_code}</span>
            <span className="text-sm opacity-80">
              {item.avg_close.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Load More */}
      {visibleCount < aggregated.length && (
        <button
          onClick={() => setVisibleCount((v) => v + BATCH)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Load More
        </button>
      )}
    </div>
  );
}
