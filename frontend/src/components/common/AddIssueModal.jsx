import React, { useState, useEffect } from "react";
import { AlertTriangle, X, CheckCircle2 } from "lucide-react";
import CustomSelect from "./CustomSelect";

const AddIssueModal = ({ onClose, onSave, issue, projectId }) => {
  const [form, setForm] = useState({
    issue: "",
    status: "Open",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (issue) {
      setForm({
        issue: issue.issue || "",
        status: issue.status || "Open",
      });
    }
  }, [issue]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.issue) {
      alert("Please enter an issue description");
      return;
    }

    setLoading(true);
    try {
      // Call API if you want to persist data
      const response = await fetch(
        issue
          ? `${import.meta.env.VITE_BACKEND_URL}/api/issues/${issue._id}`
          : `${import.meta.env.VITE_BACKEND_URL}/api/issues/${projectId}`,
        {
          method: issue ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) throw new Error("Failed to save issue");
      const data = await response.json();

      onSave(data); // Pass back to parent
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving issue ❌");
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
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {issue ? "Update Issue" : "Report Issue"}
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
            {/* Issue description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Issue Description
              </label>
              <textarea
                name="issue"
                value={form.issue}
                onChange={handleChange}
                rows="4"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
                placeholder="Describe the issue, risk, or blocker..."
              />
            </div>

            {/* Status */}
            <div>
              <CustomSelect
                label="Status"
                value={form.status}
                onChange={(value) => setForm({ ...form, status: value })}
                options={[
                  { value: "Open", label: "Open" },
                  { value: "Resolved", label: "Resolved" }
                ]}
                icon={CheckCircle2}
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
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-slate-900/20"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Issue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddIssueModal;
