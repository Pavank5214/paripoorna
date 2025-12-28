import { useEffect, useState } from "react";
import { ClipboardList, Pencil, Trash2, CheckCircle, TrendingUp, AlertTriangle, ListTodo, User, Clock } from "lucide-react";
import { useParams } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import AddTaskModal from "../common/AddTaskModal";

const TasksCard = () => {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${projectId}`);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [projectId]);

  const handleAddTask = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
    setIsAddingTask(false);
  };

  const handleEditTask = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
    setIsEditingTask(null);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task");
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete ❌");
    }
  };

  const statusBadge = (status) => {
    let styles = "bg-slate-50 text-slate-500 border-slate-200";
    let icon = null;

    if (status === "Completed") {
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
      icon = <CheckCircle className="w-3 h-3" />;
    } else if (status === "In Progress") {
      styles = "bg-amber-50 text-amber-700 border-amber-200";
      icon = <TrendingUp className="w-3 h-3" />;
    } else if (status === "Pending") {
      styles = "bg-rose-50 text-rose-700 border-rose-200";
      icon = <AlertTriangle className="w-3 h-3" />;
    }

    return (
      <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${styles}`}>
        {icon} {status}
      </span>
    );
  };

  return (
    <>
      <ProjectCard
        title="Tasks"
        icon={<ClipboardList className="w-4 h-4" />}
        onAdd={() => setIsAddingTask(true)}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 border border-slate-100 rounded-lg border-dashed">
            <ListTodo className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">No tasks scheduled</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((t) => (
              <div
                key={t._id}
                className="group bg-white rounded-lg p-4 border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all duration-300 flex flex-col gap-3"
              >
                {/* Header: Title + Status */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-800 text-sm block truncate uppercase tracking-tight group-hover:text-amber-600 transition-colors">
                      {t.taskName}
                    </span>
                    <p className={`text-xs mt-1 line-clamp-2 border-l-2 border-slate-100 pl-2 ${t.description ? 'text-slate-500' : 'text-slate-400 italic'}`}>
                      {t.description || "No additional details available"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {statusBadge(t.status)}
                    {t.priority === "High" && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 uppercase tracking-wide">
                        <AlertTriangle className="w-3 h-3" /> High
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer: Assignee + Date + Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                  <div className="flex items-center gap-4">
                    {/* Assignee */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                        {t.assignedTo ? (
                          <span className="text-[9px] font-bold">
                            {(t.assignedTo.name || t.assignedTo).charAt(0)}
                          </span>
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate max-w-[80px]">
                        {t.assignedTo ? (t.assignedTo.name || t.assignedTo) : "Unassigned"}
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      <Clock className="w-3 h-3" />
                      <span>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "Not Scheduled"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsEditingTask(t); }}
                      className="p-1.5 rounded bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all custom-tooltip"
                      aria-label="Edit Task"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTask(t._id); }}
                      className="p-1.5 rounded bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all custom-tooltip"
                      aria-label="Delete Task"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ProjectCard>

      {isAddingTask && (
        <AddTaskModal
          projectId={projectId}
          onClose={() => setIsAddingTask(false)}
          onSave={handleAddTask}
        />
      )}

      {isEditingTask && (
        <AddTaskModal
          projectId={projectId}
          task={isEditingTask}
          onClose={() => setIsEditingTask(null)}
          onSave={handleEditTask}
        />
      )}
    </>
  );
};

export default TasksCard;
