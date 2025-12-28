import { DollarSign, Pencil, Trash2, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import AddCostModal from "../common/AddCostModal";
import { useParams } from "react-router-dom";

const CostsCard = () => {
  const { id: projectId } = useParams();
  const [costs, setCosts] = useState([]);
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [isEditingCost, setIsEditingCost] = useState(null);

  // Fetch costs
  useEffect(() => {
    const fetchCosts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/costs/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch costs");
        const data = await res.json();
        setCosts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCosts();
  }, [projectId]);

  // Add, Edit, Delete handlers
  const handleAddCost = (newCost) => setCosts((prev) => [...prev, newCost]);
  const handleEditCost = (updatedCost) => {
    setCosts((prev) =>
      prev.map((c) => (c._id === updatedCost._id ? updatedCost : c))
    );
    setIsEditingCost(null);
  };
  const handleDeleteCost = async (id) => {
    if (!window.confirm("Delete this cost?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/costs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete cost");
      setCosts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete ❌");
    }
  };

  return (
    <>
      <ProjectCard
        title="Costs"
        icon={<DollarSign className="w-4 h-4" />}
        onAdd={() => setIsAddingCost(true)}
      >
        {costs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 border border-slate-100 rounded-lg border-dashed">
            <Receipt className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">No costs recorded</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="py-3 px-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="py-3 px-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="py-3 px-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {costs.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-sm bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium text-xs truncate max-w-[150px]">{c.description}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 text-xs">₹{c.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${c.status === "Paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[10px] font-mono">{new Date(c.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setIsEditingCost(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition"
                          aria-label="Edit Cost"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCost(c._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          aria-label="Delete Cost"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ProjectCard>

      {/* Add Cost Modal */}
      {isAddingCost && (
        <AddCostModal
          projectId={projectId}
          onClose={() => setIsAddingCost(false)}
          onSave={handleAddCost}
        />
      )}

      {/* Edit Cost Modal */}
      {isEditingCost && (
        <AddCostModal
          projectId={projectId}
          cost={isEditingCost}
          onClose={() => setIsEditingCost(null)}
          onSave={handleEditCost}
        />
      )}
    </>
  );
};

export default CostsCard;
