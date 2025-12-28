import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, PackageX, Package, Search } from "lucide-react";

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/materials`);
        const data = await res.json();
        setMaterials(data);
      } catch (err) {
        console.error("Failed to fetch materials", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const filteredMaterials =
    filter === "All"
      ? materials
      : materials.filter((m) => m.status === filter);

  if (loading) {
    return (
      <section className="px-6 py-10 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <Package className="w-8 h-8 text-slate-300" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading inventory...</p>
        </div>
      </section>
    );
  }

  const statusBadge = (status) => {
    if (status === "Low Stock") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-100 rounded border border-amber-200 uppercase tracking-wide">
          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
        </span>
      );
    }
    if (status === "Out of Stock") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-100 rounded border border-rose-200 uppercase tracking-wide">
          <PackageX className="w-3.5 h-3.5" /> Out of Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded border border-emerald-200 uppercase tracking-wide">
        <CheckCircle className="w-3.5 h-3.5" /> Available
      </span>
    );
  };

  return (
    <section className="px-4 sm:px-8 py-8 bg-slate-200 min-h-screen font-sans">
      {/* Header + Filters */}
      <div className="sticky top-0 z-10 bg-slate-200 backdrop-blur pb-4 mb-2 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 rounded-xl shadow-lg shadow-slate-900/20">
              <Package className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Materials Inventory
              </h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Global Stock Overview
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["All", "Available", "Low Stock", "Out of Stock"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wide border ${filter === f
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-500 border-slate-200 hover:border-amber-300 hover:text-slate-700"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden mt-6">
        {filteredMaterials.map((material) => (
          <div
            key={material._id}
            className="bg-white rounded-xl shadow-sm p-4 border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {material.materialName}
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase mt-1">
                  {material.projectId?.name || "Unassigned"}
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                Qty: {material.quantity}
              </span>
            </div>
            {statusBadge(material.status)}
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white mt-6">
        <table className="min-w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-500 tracking-wider uppercase">Project</th>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-500 tracking-wider uppercase">Material Name</th>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-500 tracking-wider uppercase">Quantity</th>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-500 tracking-wider uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMaterials.map((material) => (
              <tr
                key={material._id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                <td className="py-4 px-6 text-sm text-slate-800 font-bold uppercase tracking-tight">
                  {material.projectId?.name || <span className="text-slate-400 italic">Unassigned</span>}
                </td>
                <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                  {material.materialName}
                </td>
                <td className="py-4 px-6 text-sm text-slate-700 font-mono font-bold">
                  {material.quantity}
                </td>
                <td className="py-4 px-6">
                  {statusBadge(material.status)}
                </td>
              </tr>
            ))}
            {filteredMaterials.length === 0 && (
              <tr>
                <td colSpan="4" className="py-12 text-center text-slate-400 font-bold uppercase text-sm tracking-wide">
                  No materials found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Materials;
