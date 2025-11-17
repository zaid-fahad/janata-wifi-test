import { useEffect, useState, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import DataTable from "./components/Table";

export default function App() {
  const BATCH_SIZE = 200;
  const [allRows, setAllRows] = useState([]);
  const [visibleRows, setVisibleRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const BASE_URL = "http://localhost:5050";

  const loaderRef = useRef(null);

  // Fetch Data
  useEffect(() => {
    fetch(BASE_URL + "/data")
      .then((res) => res.json())
      .then((json) => {
        setAllRows(json.data);
        setVisibleRows(json.data.slice(0, BATCH_SIZE));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  // Filtered data based on search
  const filteredRows = search
    ? allRows.filter((row) =>
        row.trade_code.toLowerCase().includes(search.toLowerCase())
      )
    : allRows;

  // Lazy Load
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

  // Reset visibleRows when search changes
  useEffect(() => {
    setVisibleRows(filteredRows.slice(0, BATCH_SIZE));
  }, [search, allRows]);

  // ------------------ Skeleton Loader ------------------
  const renderSkeleton = () => {
    return Array.from({ length: 10 }).map((_, idx) => (
      <div
        key={idx}
        className="animate-pulse flex space-x-4 py-2 border-b"
      >
        {Array.from({ length: 7 }).map((__, i) => (
          <div
            key={i}
            className="bg-gray-300 h-4 w-full rounded"
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Stock Market Explorer</h1>

      {/* Search */}
      <div className="flex items-center border rounded-lg px-3 py-1.5 bg-white max-w-md mb-6">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by trade code..."
          className="ml-2 outline-none text-sm w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Skeleton while loading */}
      {loading && <div className="border rounded-xl shadow bg-white overflow-hidden">{renderSkeleton()}</div>}

      {/* Table */}
      {!loading && visibleRows.length > 0 && (
        <DataTable
          data={visibleRows}
          loaderRef={loaderRef}
          />
      )}
    </div>
  );
}
