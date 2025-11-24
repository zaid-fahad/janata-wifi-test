import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import DataTable from "./components/Table";
import StockChart from "./components/Chart";
import MoodRadar from "./components/MoodRadar";
import Heatmap from "./components/HeatmapBar";

export default function Dashboard() {
  const BATCH_SIZE = 50;
  const [allRows, setAllRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newStock, setNewStock] = useState({
    trade_code: "",
    date: "",
    high: "",
    low: "",
    open: "",
    close: "",
    volume: "",
  });

  const BASE_URL = "http://localhost:5050";
  const loaderRef = useRef(null);

  // ------------------ Fetch Data ------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/stocks/`);
      const data = await res.json();
      setAllRows(data);
      setVisibleRows(data.slice(0, BATCH_SIZE));
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ------------------ Filtered rows ------------------
  const filteredRows = useMemo(() => {
    if (!search) return allRows;
    return allRows.filter((row) =>
      row.trade_code.toLowerCase().includes(search.toLowerCase())
    );
  }, [allRows, search]);

  // ------------------ Lazy Load ------------------
  const loadMore = useCallback(() => {
    setVisibleRows((prev) => {
      const nextIndex = prev.length;
      return [...prev, ...filteredRows.slice(nextIndex, nextIndex + BATCH_SIZE)];
    });
  }, [filteredRows]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    setVisibleRows(filteredRows.slice(0, BATCH_SIZE));
  }, [filteredRows]);

  // ------------------ Dashboard Stats ------------------
  const stats = useMemo(() => {
    if (!allRows.length) return { avgClose: 0, avgHigh: 0, avgLow: 0, avgVolume: 0 };

    const avgClose = allRows.reduce((a, b) => a + Number(b.close), 0) / allRows.length;
    const avgHigh = allRows.reduce((a, b) => a + Number(b.high), 0) / allRows.length;
    const avgLow = allRows.reduce((a, b) => a + Number(b.low), 0) / allRows.length;
    const avgVolume = allRows.reduce((a, b) => a + Number(b.volume), 0) / allRows.length;

    return { avgClose, avgHigh, avgLow, avgVolume };
  }, [allRows]);

  // ------------------ Skeleton Loader ------------------
  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse h-36 bg-gradient-to-r from-pastel-blue to-pastel-green rounded-xl" />
      ))}
    </div>
  );

  // ------------------ Handle Create Stock ------------------
  const handleCreateStock = async () => {
    try {
      const res = await fetch(`${BASE_URL}/stocks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStock,
          high: parseFloat(newStock.high),
          low: parseFloat(newStock.low),
          open: parseFloat(newStock.open),
          close: parseFloat(newStock.close),
          volume: parseFloat(newStock.volume),
        }),
      });
      if (!res.ok) throw new Error("Failed to create stock");
      const created = await res.json();
      setAllRows([created, ...allRows]);
      setVisibleRows([created, ...visibleRows]);
      setShowForm(false);
      setNewStock({
        trade_code: "",
        date: "",
        high: "",
        low: "",
        open: "",
        close: "",
        volume: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="p-6 bg-pastel-gray min-h-screen space-y-8 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Stock Dashboard</h1>
       
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Avg Close", value: stats.avgClose },
          { title: "Avg High", value: stats.avgHigh },
          { title: "Avg Low", value: stats.avgLow },
          { title: "Avg Volume", value: stats.avgVolume },
        ].map((stat) => (
          <div
            key={stat.title}
            className={`p-6 rounded-xl shadow-md bg-gradient-to-r `}
          >
            <p className="text-sm">{stat.title}</p>
            <p className="text-2xl font-bold mt-2">{stat.value.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? renderSkeleton() : <StockChart allRows={allRows} />}
        {!loading && <MoodRadar allRows={allRows} />}
        {!loading && <Heatmap allRows={allRows} />}
      </div>

      {/* Add Stock Form */}
      {showForm && (
        <div className="p-6 border rounded-xl bg-white max-w-md space-y-4">
          {Object.keys(newStock).map((key) => (
            <input
              key={key}
              type={key === "date" ? "date" : "text"}
              placeholder={key}
              className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-pastel-blue"
              value={newStock[key]}
              onChange={(e) =>
                setNewStock((prev) => ({ ...prev, [key]: e.target.value }))
              }
            />
          ))}
          <button
            onClick={handleCreateStock}
            className="bg-pastel-blue text-white px-4 py-2 rounded-lg hover:bg-blue-400"
          >
            Save Stock
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center border rounded-lg px-3 py-1.5 bg-white w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by trade code..."
              className="ml-2 outline-none text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-400"
          >
            <Plus className="w-4 h-4" /> Add Stock
          </button>
        </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-4">{renderSkeleton()}</div>
        ) : (
          <DataTable
            data={visibleRows}
            loaderRef={loaderRef}
            setAllRows={setAllRows}
            allRows={allRows}
            BASE_URL={BASE_URL}
          />
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
