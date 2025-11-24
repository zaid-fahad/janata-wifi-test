import { useEffect, useState, useRef, useCallback } from "react";
import { Search, Plus } from "lucide-react";
import DataTable from "./components/Table";
import StockChart from "./components/Chart";

export default function App() {
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

  // ------------------ Filtered data ------------------
  const filteredRows = search
    ? allRows.filter((row) =>
        row.trade_code.toLowerCase().includes(search.toLowerCase())
      )
    : allRows;

  // ------------------ Lazy Load ------------------
  const loadMore = useCallback(() => {
    setVisibleRows((prev) => {
      const nextIndex = prev.length;
      const nextBatch = filteredRows.slice(nextIndex, nextIndex + BATCH_SIZE);
      return [...prev, ...nextBatch];
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
  }, [search, allRows]);

  // ------------------ Skeleton Loader ------------------
  const renderSkeleton = () => {
    return Array.from({ length: 10 }).map((_, idx) => (
      <div key={idx} className="animate-pulse flex space-x-4 py-2 border-b">
        {Array.from({ length: 7 }).map((__, i) => (
          <div key={i} className="bg-gray-300 h-4 w-full rounded" />
        ))}
      </div>
    ));
  };

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
      setAllRows([created, ...allRows]); // prepend new stock
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Stock Market Explorer</h1>
      <h1 className="text-3xl font-bold mb-6">Stock Market Explorer</h1>

      <StockChart allRows={allRows} />

      {/* Search + Create Button */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center border rounded-lg px-3 py-1.5 bg-white max-w-md">
          <Search className="w-4 h-4 text-gray-500" />
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
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Create Stock
        </button>
      </div>

      {/* Create Stock Form */}
      {showForm && (
        <div className="mb-6 p-4 border rounded bg-white space-y-2">
          {Object.keys(newStock).map((key) => (
            <input
              key={key}
              type={key === "date" ? "date" : "text"}
              placeholder={key}
              className="border px-2 py-1 rounded w-full"
              value={newStock[key]}
              onChange={(e) =>
                setNewStock((prev) => ({ ...prev, [key]: e.target.value }))
              }
            />
          ))}
          <button
            onClick={handleCreateStock}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {/* Skeleton */}
      {loading && (
        <div className="border rounded-xl shadow bg-white overflow-hidden">
          {renderSkeleton()}
        </div>
      )}

      {/* Table */}
      {!loading && visibleRows.length > 0 && (
        <DataTable
          data={visibleRows}
          loaderRef={loaderRef}
          setAllRows={setAllRows}
          allRows={allRows}
          BASE_URL={BASE_URL}
        />
      )}
    </div>
  );
}
