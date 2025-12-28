import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CircularProgress from "./CircularProgress";
import CostsDistribution from "./CostsDistribution";
import BudgetOverview from "./BudgetOverview";
import ProjectDetails from "./ProjectDetails";
import EditProjectModal from "../common/EditProjectModal";

const ProjectHeader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: parse plannedBudget safely
  const parseBudget = (budgetStr) => {
    if (!budgetStr) return 0;
    const numeric = budgetStr.toString().replace(/[^0-9.]/g, ""); // remove commas, ₹ etc
    return numeric ? parseFloat(numeric) : 0;
  };

  // Fetch Project Details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Project not found");
        const data = await res.json();

        // Ensure plannedBudget is numeric
        data.plannedBudget = parseBudget(data.plannedBudget);
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete project");
      navigate("/projects");
    } catch (err) {
      alert("Failed to delete project ❌");
    }
  };

  if (loading) return <p className="p-6 text-center text-gray-500">Loading project...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <ProjectDetails
        project={project}
        onEdit={() => setIsEditing(true)}
        onDelete={handleDeleteProject}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CircularProgress progress={project.progress || 0} />
        <CostsDistribution projectId={id} />
        <BudgetOverview projectId={id} />
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <EditProjectModal
          project={project}
          onClose={() => setIsEditing(false)}
          onSave={(updated) => {
            // Ensure plannedBudget is numeric after editing
            updated.plannedBudget = parseBudget(updated.plannedBudget);
            setProject(updated);
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
};

export default ProjectHeader;
