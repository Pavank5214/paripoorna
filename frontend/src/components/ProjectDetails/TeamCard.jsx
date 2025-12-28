import { useState, useEffect } from "react";
import { Users, Pencil, Trash2, UserCircle2 } from "lucide-react";
import ProjectCard from "./ProjectCard";
import AddTeamModal from "../common/AddTeamModal"; // make sure you have this modal
import { useParams } from "react-router-dom";

const TeamCard = () => {
  const { id: projectId } = useParams();
  const [workers, setWorkers] = useState([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(null);

  // Fetch all workers
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/workers/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch team members");
        const data = await res.json();
        setWorkers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWorkers();
  }, [projectId]);

  // Add member
  const handleAddMember = (newMember) => {
    setWorkers((prev) => [...prev, newMember]);
  };

  // Edit member
  const handleEditMember = (updatedMember) => {
    setWorkers((prev) =>
      prev.map((m) => (m._id === updatedMember._id ? updatedMember : m))
    );
    setIsEditingMember(null);
  };

  // Delete member
  const handleDeleteMember = async (id) => {
    if (!window.confirm("Delete this member?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/workers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete member");
      setWorkers((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete member ❌");
    }
  };

  return (
    <>
      <ProjectCard
        title="Team Members"
        icon={<Users className="w-4 h-4" />}
        onAdd={() => setIsAddingMember(true)}
      >
        {workers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 border border-slate-100 rounded-lg border-dashed">
            <Users className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">No workers assigned</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {workers.map((m) => (
              <div
                key={m._id}
                className="relative flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all group"
              >
                {/* Left: Name, Role, Number */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="w-4 h-4 text-slate-400" />
                    <p className="font-bold text-slate-700 text-xs uppercase tracking-tight">{m.name}</p>
                  </div>
                  {m.number && (
                    <p className="text-slate-500 text-xs font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      📞 <a href={`tel:${m.number}`} className="hover:text-amber-600 transition-colors">{m.number}</a>
                    </p>
                  )}
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{m.role}</p>
                </div>

                {/* Right: Edit/Delete buttons */}
                <div className="flex gap-1 ml-2 sm:ml-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setIsEditingMember(m)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors"
                    aria-label="Edit Member"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(m._id)}
                    className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    aria-label="Delete Member"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ProjectCard>

      {/* Add/Edit Modals */}
      {isAddingMember && (
        <AddTeamModal
          projectId={projectId}
          onClose={() => setIsAddingMember(false)}
          onSave={handleAddMember}
        />
      )}
      {isEditingMember && (
        <AddTeamModal
          projectId={projectId}
          member={isEditingMember}
          onClose={() => setIsEditingMember(null)}
          onSave={handleEditMember}
        />
      )}
    </>
  );
};

export default TeamCard;
