import { useState, useEffect } from "react";
import { AlertTriangle, Pencil, Trash2, CheckCircle, ShieldAlert } from "lucide-react";
import ProjectCard from "./ProjectCard";
import AddIssueModal from "../common/AddIssueModal";
import { useParams } from "react-router-dom";

const IssuesCard = () => {
  const { id: projectId } = useParams();
  const [issues, setIssues] = useState([]);
  const [isAddingIssue, setIsAddingIssue] = useState(false);
  const [isEditingIssue, setIsEditingIssue] = useState(null);

  // Fetch issues
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/issues/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch issues");
        const data = await res.json();
        setIssues(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchIssues();
  }, [projectId]);

  const handleAddIssue = (newIssue) => {
    setIssues((prev) => [...prev, newIssue]);
    setIsAddingIssue(false);
  };

  const handleEditIssue = (updatedIssue) => {
    setIssues((prev) =>
      prev.map((iss) => (iss._id === updatedIssue._id ? updatedIssue : iss))
    );
    setIsEditingIssue(null);
  };

  const handleDeleteIssue = async (id) => {
    if (!window.confirm("Delete this issue?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/issues/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete issue");
      setIssues((prev) => prev.filter((iss) => iss._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete issue ❌");
    }
  };

  const statusBadge = (status) => {
    return status === "Open" ? (
      <span className="text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Open
      </span>
    ) : (
      <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
        <CheckCircle className="w-3 h-3" /> Resolved
      </span>
    );
  };

  return (
    <>
      <ProjectCard
        title="Issues / Risks"
        icon={<AlertTriangle className="w-4 h-4" />}
        onAdd={() => setIsAddingIssue(true)}
      >
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 border border-slate-100 rounded-lg border-dashed">
            <ShieldAlert className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">No issues reported</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {issues.map((iss) => (
              <div
                key={iss._id}
                className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all group"
              >
                {/* Left: Issue description + status */}
                <div className="flex items-center gap-3 min-w-0 truncate flex-1">
                  <span className="text-slate-700 font-bold text-xs uppercase tracking-tight truncate">{iss.issue}</span>
                  {statusBadge(iss.status)}
                </div>

                {/* Right: Edit/Delete */}
                <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setIsEditingIssue(iss)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors"
                    aria-label="Edit Issue"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteIssue(iss._id)}
                    className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    aria-label="Delete Issue"
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
      {isAddingIssue && (
        <AddIssueModal
          projectId={projectId}
          onClose={() => setIsAddingIssue(false)}
          onSave={handleAddIssue}
        />
      )}
      {isEditingIssue && (
        <AddIssueModal
          projectId={projectId}
          issue={isEditingIssue}
          onClose={() => setIsEditingIssue(null)}
          onSave={handleEditIssue}
        />
      )}
    </>
  );
};

export default IssuesCard;
