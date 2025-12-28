import { useEffect, useState } from "react";
import { Package, Pencil, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import AddMaterialModal from "../common/AddMaterialModal";

const MaterialsCard = () => {
  const { id: projectId } = useParams(); // ✅ get project id from URL
  const [materials, setMaterials] = useState([]);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [isEditingMaterial, setIsEditingMaterial] = useState(null);

  // ✅ Fetch materials for this project only
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/materials/${projectId}`);
        if (!response.ok) throw new Error("Failed to fetch materials");
        const data = await response.json();
        setMaterials(data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };
    fetchMaterials();
  }, [projectId]);


  // Add new material
  const handleAddMaterial = (newMaterial) => {
    setMaterials((prev) => [...prev, newMaterial]);
    setIsAddingMaterial(false);
  };

  // Edit material
  const handleEditMaterial = (updatedMaterial) => {
    setMaterials((prev) =>
      prev.map((m) => (m._id === updatedMaterial._id ? updatedMaterial : m))
    );
    setIsEditingMaterial(null);
  };

  // Delete material
  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/materials/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete material");

      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Error deleting material:", err);
      alert("Failed to delete material ❌");
    }
  };

  return (
    <>
      <ProjectCard
        title="Materials"
        icon={<Package className="w-4 h-4" />}
        onAdd={() => setIsAddingMaterial(true)}
      >
        {materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 border border-slate-100 rounded-lg border-dashed">
            <Package className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">No materials listed</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {materials.map((m) => (
              <div
                key={m._id}
                className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all group"
              >
                {/* Left: Material details */}
                <div className="flex flex-wrap gap-3 items-center min-w-0">
                  <span className="font-bold text-slate-700 text-sm truncate uppercase tracking-tight">
                    {m.materialName}
                  </span>
                  <span className="text-slate-500 text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-mono font-bold">
                    QTY: {m.quantity}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${m.status === "Low Stock"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : m.status === "Out of Stock"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                  >
                    {m.status}
                  </span>
                </div>

                {/* Right: Edit/Delete buttons */}
                <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setIsEditingMaterial(m)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors"
                    aria-label="Edit Material"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(m._id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    aria-label="Delete Material"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ProjectCard>

      {/* Add Material Modal */}
      {isAddingMaterial && (
        <AddMaterialModal
          projectId={projectId} // ✅ pass project id
          onClose={() => setIsAddingMaterial(false)}
          onSave={handleAddMaterial}
        />
      )}

      {/* Edit Material Modal */}
      {isEditingMaterial && (
        <AddMaterialModal
          projectId={projectId} // ✅ keep it tied to project
          material={isEditingMaterial}
          onClose={() => setIsEditingMaterial(null)}
          onSave={handleEditMaterial}
        />
      )}
    </>
  );
};

export default MaterialsCard;
