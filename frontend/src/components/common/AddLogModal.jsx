import React, { useState, useEffect } from "react";
import { BookOpen, X } from "lucide-react";

const AddLogModal = ({ onClose, onSave, log, projectId }) => {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10), // today's date
    note: "",
  });

  const [loading, setLoading] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (log) {
      setForm({
        date: log.date || new Date().toISOString().slice(0, 10),
        note: log.note || "",
      });
    }
  }, [log]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.note) {
      alert("Please enter a note");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        log
          ? `${import.meta.env.VITE_BACKEND_URL}/api/logs/${log._id}`
          : `${import.meta.env.VITE_BACKEND_URL}/api/logs/${projectId}`,
        {
          method: log ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: form.date,
            note: form.note,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save log");
      const data = await response.json();

      onSave(data); // pass back to parent
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving log ❌");
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
              <BookOpen className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {log ? "Update Log" : "Daily Log"}
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

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Log Entry
              </label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                rows="4"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
                placeholder="Work done, weather conditions, workers present..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-all text-xs font-bold uppercase tracking-wider"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-slate-900/20"
              >
                {loading ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLogModal;
