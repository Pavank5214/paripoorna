import { useState } from "react";
import { FolderPlus, X } from "lucide-react";

const AddProjectModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    location: "",
    progress: 0,
    deadline: "",
    manager: "",
    plannedBudget: "",
    description: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // Sanitize plannedBudget: remove commas, ₹ symbols, etc.
      const sanitizedBudget = form.plannedBudget.replace(/[₹,]/g, "").trim();

      const payload = {
        ...form,
        plannedBudget: sanitizedBudget,
        coordinates: {
          lat: form.latitude ? parseFloat(form.latitude) : null,
          lng: form.longitude ? parseFloat(form.longitude) : null
        }
      };

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add project");

      const newProject = await res.json();
      onSave(newProject);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error adding project ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg shadow-sm">
              <FolderPlus className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">New Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Project Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="ENTER PROJECT TITLE"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal uppercase tracking-wide"
                required
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. HYDERABAD, INDIA"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="17.3850"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="78.4867"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Manager */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Project Manager
                </label>
                <input
                  type="text"
                  name="manager"
                  value={form.manager}
                  onChange={handleChange}
                  placeholder="MANAGER NAME"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all uppercase"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Target Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Planned Budget */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Planned Budget (₹)
                </label>
                <input
                  type="text"
                  name="plannedBudget"
                  value={form.plannedBudget}
                  onChange={handleChange}
                  placeholder="25,00,000"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              {/* Progress */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Current Progress (%)
                </label>
                <input
                  type="number"
                  name="progress"
                  value={form.progress}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Project Brief
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter project description and key objectives..."
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-all text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-slate-900/20 flex items-center gap-2"
                disabled={loading}
              >
                {loading ? "Initializing..." : "Initialize Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;
