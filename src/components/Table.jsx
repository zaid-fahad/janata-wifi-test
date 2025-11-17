import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Save, Trash } from "lucide-react";

export default function DataTable({ data, loaderRef, setAllRows, allRows, BASE_URL }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [editingId, setEditingId] = useState(null);
  const [rowData, setRowData] = useState({});

  // ------------------ Sorting ------------------
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let x = a[sortConfig.key];
    let y = b[sortConfig.key];
    if (!isNaN(Number(x))) { x = Number(x); y = Number(y); }
    if (x < y) return sortConfig.direction === "asc" ? -1 : 1;
    if (x > y) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
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

  // ------------------ Editable ------------------
  const startEdit = (id, row) => {
    setEditingId(id);
    setRowData(row);
  };

  const handleChange = (e, key) => {
    setRowData({ ...rowData, [key]: e.target.value });
  };

  const saveRow = async (id) => {
    const response = await fetch(`${BASE_URL}/stocks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rowData),
    });
    if (response.ok) {
      const updatedRow = await response.json();
      setAllRows(allRows.map(r => r.id === id ? updatedRow : r));
      setEditingId(null);
    }
  };

  const deleteRow = async (id) => {
    const confirmed = confirm("Are you sure you want to delete?");
    if (!confirmed) return;
    const response = await fetch(`${BASE_URL}/stocks/${id}`, { method: "DELETE" });
    if (response.ok) {
      setAllRows(allRows.filter(r => r.id !== id));
    }
  };

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
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => (
                <tr key={row.id} className="even:bg-gray-50 hover:bg-gray-100">
                  {Object.keys(row).map((key) => (
                    <td key={key} className="px-4 py-2 border-b">
                      {editingId === row.id && key !== "id" ? (
                        <input
                          type={typeof row[key] === "number" ? "number" : "text"}
                          value={rowData[key]}
                          onChange={(e) => handleChange(e, key)}
                          className="border px-1 w-full"
                        />
                      ) : (
                        row[key]
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2 border-b flex gap-2">
                    {editingId === row.id ? (
                      <button onClick={() => saveRow(row.id)} className="text-green-500">
                        <Save />
                      </button>
                    ) : (
                      <button onClick={() => startEdit(row.id, row)} className="text-blue-500">
                        Edit
                      </button>
                    )}
                    <button onClick={() => deleteRow(row.id)} className="text-red-500">
                      <Trash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Lazy Load */}
          <div ref={loaderRef} className="w-full py-4 text-center text-gray-400">
            Loading more...
          </div>
        </div>
      </div>
    </div>
  );
}
