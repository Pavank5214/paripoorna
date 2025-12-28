import React, { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, TrendingUp, DollarSign, Filter } from "lucide-react";

const Costs = () => {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchCosts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/costs`);
        const data = await res.json();
        setCosts(data);
      } catch (err) {
        console.error("Failed to fetch costs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCosts();
  }, []);

  const statusBadge = (status) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded border border-emerald-200 uppercase tracking-wide">
            <CheckCircle className="w-3.5 h-3.5" /> Paid
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-100 rounded border border-amber-200 uppercase tracking-wide">
            <TrendingUp className="w-3.5 h-3.5" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-100 rounded border border-rose-200 uppercase tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5" /> Unknown
          </span>
        );
    }
  };

  const filteredCosts =
    filter === "All" ? costs : costs.filter((c) => c.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
        <DollarSign className="w-8 h-8 text-slate-300 animate-pulse" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading finances...</p>
      </div>
    );
  }

  return (
    <section className="px-4 sm:px-8 py-8 bg-slate-200 min-h-screen font-sans">
      {/* Header + Filter */}
      <div className="sticky top-0 z-10 bg-slate-200 backdrop-blur pb-4 mb-2 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 rounded-xl shadow-lg shadow-slate-900/20">
              <DollarSign className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Project Costs
              </h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Financial Overview & Tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["All", "Paid", "Pending"].map((f) => (
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
        {filteredCosts.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-xl shadow-sm p-4 border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {item.projectId?.name || "Unnamed Project"}
                </h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded border border-slate-200">
                  {item.category}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-800 text-lg">
                ₹{item.amount.toLocaleString()}
              </span>
            </div>
            <p className="text-slate-500 text-xs mb-3 italic border-l-2 border-slate-200 pl-2">
              {item.description}
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {new Date(item.date).toLocaleDateString()}
              </span>
              {statusBadge(item.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white mt-6">
        <table className="min-w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-500 tracking-wider uppercase">Project</th>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-500 tracking-wider uppercase">Category</th>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-500 tracking-wider uppercase">Description</th>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-500 tracking-wider uppercase">Amount</th>
              <th className="text-left py-4 px-6 text-xs font-black text-slate-500 tracking-wider uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCosts.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                <td className="py-4 px-6 text-sm text-slate-800 font-bold uppercase tracking-tight">
                  {item.projectId?.name || <span className="text-slate-400 italic">Unnamed Project</span>}
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase rounded border border-slate-200">
                    {item.category}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-slate-500 italic">
                  {item.description}
                </td>
                <td className="py-4 px-6 text-sm text-slate-800 font-mono font-bold">
                  ₹{item.amount.toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  {statusBadge(item.status)}
                </td>
              </tr>
            ))}
            {filteredCosts.length === 0 && (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400 font-bold uppercase text-sm tracking-wide">
                  No cost records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Costs;
