import { useState, useEffect } from "react";
import { Receipt, X, CreditCard } from "lucide-react";
import CustomSelect from "./CustomSelect";

const AddCostModal = ({ onClose, onSave, cost, projectId }) => {
  const [form, setForm] = useState({
    category: "",
    description: "",
    amount: "",
    status: "Pending",
    date: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (cost) {
      setForm({
        category: cost.category || "",
        description: cost.description || "",
        amount: cost.amount || "",
        status: cost.status || "Pending",
        date: cost.date || new Date().toISOString().slice(0, 10),
      });
    }
  }, [cost]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category || !form.description || !form.amount) {
      alert("Category, Description, and Amount are required");
      return;
    }

    setLoading(true);

    try {
      const url = cost
        ? `${import.meta.env.VITE_BACKEND_URL}/api/costs/${cost._id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/costs/${projectId}`;

      const response = await fetch(url, {
        method: cost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to save cost");
      const data = await response.json();

      onSave(data); // pass back to parent
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving cost ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg shadow-sm">
              <Receipt className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {cost ? "Update Cost" : "Add Cost"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Cost Category
              </label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal uppercase tracking-wide"
                placeholder="e.g. MATERIALS, LABOR"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="Detailed cost description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 font-mono"
                  placeholder="0"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <CustomSelect
                label="Payment Status"
                value={form.status}
                onChange={(value) => setForm({ ...form, status: value })}
                options={[
                  { value: "Pending", label: "Pending" },
                  { value: "Paid", label: "Paid" }
                ]}
                icon={CreditCard}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-all text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-slate-900/20"
              >
                {loading ? "Saving..." : "Save Cost"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCostModal;
