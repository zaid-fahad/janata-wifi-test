// src/components/Table.jsx
import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export default function DataTable({ data, loaderRef }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      let x = a[sortConfig.key];
      let y = b[sortConfig.key];

      // Convert numeric values
      if (!isNaN(Number(x))) {
        x = Number(x);
        y = Number(y);
      }

      if (x < y) return sortConfig.direction === "asc" ? -1 : 1;
      if (x > y) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 text-gray-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-gray-500" />
    );
  };

  // Table 
  return (
    <div className="p-6">
      <div className="border rounded-xl shadow bg-white overflow-hidden">
        <div className="overflow-y-auto" style={{ height: "60vh" }}>
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 shadow">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-2 font-semibold text-left border-b cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-1">
                      {key}
                      {renderSortIcon(key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sortedData.map((row, idx) => (
                <tr key={idx} className="even:bg-gray-50 hover:bg-gray-100">
                  {Object.values(row).map((v, i) => (
                    <td key={i} className="px-4 py-2 border-b">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Lazy Load Trigger */}
<div
  ref={loaderRef}
  className="flex items-center justify-center py-4 space-x-2"
>
  <div className="w-5 h-5 border-2 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
  <span className="text-gray-500 text-sm">Loading more data...</span>
</div>

        </div>
      </div>
    </div>
  );
}
