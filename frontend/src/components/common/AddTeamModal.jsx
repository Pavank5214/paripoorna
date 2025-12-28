import React, { useState, useEffect } from "react";
import { UserPlus, X } from "lucide-react";

const AddTeamModal = ({ member, onClose, onSave, projectId }) => {
  const [form, setForm] = useState({
    name: "",
    role: "",
    number: "",
  });
  const [loading, setLoading] = useState(false);

  // Load data if editing
  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || "",
        role: member.role || "",
        number: member.number || "",
      });
    }
  }, [member]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.role) {
      alert("Name and Role are required ❌");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        member
          ? `${import.meta.env.VITE_BACKEND_URL}/api/workers/${member._id}`
          : `${import.meta.env.VITE_BACKEND_URL}/api/workers/${projectId}`,
        {
          method: member ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) throw new Error("Failed to save member");
      const data = await response.json();

      onSave(data); // pass new/updated member back to parent
      onClose();
    } catch (error) {
      console.error("Error saving member:", error);
      alert("Error saving member ❌");
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
              <UserPlus className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {member ? "Update Member" : "Add Team Member"}
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
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal uppercase tracking-wide"
                placeholder="ENTER MEMBER NAME"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Role / Designation
              </label>
              <input
                type="text"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all uppercase"
                placeholder="e.g. SITE ENGINEER"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="number"
                value={form.number}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="+91 98765 43210"
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
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-slate-900/20"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Member"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTeamModal;
