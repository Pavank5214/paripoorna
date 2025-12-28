import React, { useState, useEffect } from "react";
import { Package, X, AlertOctagon } from "lucide-react";
import CustomSelect from "./CustomSelect";

const AddMaterialModal = ({ onClose, onSave, material, projectId }) => {
  const [form, setForm] = useState({
    materialName: "",
    quantity: "",
    status: "Available",
    project: projectId, // ✅ tie to project
  });

  const [loading, setLoading] = useState(false);

  // preload if editing
  useEffect(() => {
    if (material) {
      setForm({
        materialName: material.materialName,
        quantity: material.quantity,
        status: material.status,
        project: material.project || projectId, // ✅ keep project
      });
    }
  }, [material, projectId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.materialName || !form.quantity) {
      alert("Material name and quantity are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        material
          ? `${import.meta.env.VITE_BACKEND_URL}/api/materials/item/${material._id}` // ✅ edit material
          : `${import.meta.env.VITE_BACKEND_URL}/api/materials/${projectId}`,        // ✅ add to project
        {
          method: material ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) throw new Error("Failed to save material");

      const data = await response.json();
      onSave(data); // send back to parent
      onClose();
    } catch (error) {
      console.error("Error saving material:", error);
      alert("Error saving material ❌");
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
              <Package className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {material ? "Update Material" : "Add Material"}
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
            {/* Material Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Material Name
              </label>
              <input
                type="text"
                name="materialName"
                value={form.materialName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal uppercase tracking-wide"
                placeholder="e.g. CEMENT BAGS"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 font-mono"
                placeholder="0"
              />
            </div>

            {/* Status */}
            <div>
              <CustomSelect
                label="Stock Status"
                value={form.status}
                onChange={(value) => setForm({ ...form, status: value })}
                options={[
                  { value: "Available", label: "Available" },
                  { value: "Low Stock", label: "Low Stock" },
                  { value: "Out of Stock", label: "Out of Stock" }
                ]}
                icon={AlertOctagon}
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
                {loading ? "Saving..." : "Save Material"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMaterialModal;
