import React, { useEffect, useState } from "react";
import { Calendar, CheckCircle, AlertCircle, Clock, ClipboardList, AlertTriangle, TrendingUp, User } from "lucide-react";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Ensure data is an array
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded border border-emerald-200 uppercase tracking-wide">
          <CheckCircle className="w-3.5 h-3.5" /> Completed
        </span>
      );
    }
    if (s === "in progress") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-100 rounded border border-amber-200 uppercase tracking-wide">
          <TrendingUp className="w-3.5 h-3.5" /> In Progress
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-100 rounded border border-rose-200 uppercase tracking-wide">
          <AlertCircle className="w-3.5 h-3.5" /> Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-slate-100 rounded border border-slate-200 uppercase tracking-wide">
        {status}
      </span>
    );
  };

  const filteredTasks = filter === "All" ? tasks : tasks.filter(t => t.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
        <ClipboardList className="w-8 h-8 text-slate-300 animate-pulse" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading tasks...</p>
      </div>
    );
  }

  return (
    <section className="px-4 sm:px-8 py-8 bg-slate-200 min-h-screen font-sans">
      {/* Header + Filter */}
      <div className="sticky top-0 z-10 bg-slate-200 backdrop-blur pb-4 mb-2 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 rounded-xl shadow-lg shadow-slate-900/20">
              <ClipboardList className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Project Tasks
              </h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Assignments & Tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["All", "Pending", "In Progress", "Completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wide border ${filter === f
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-500 border-slate-200 hover:border-amber-300 hover:text-slate-700"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-100 border-dashed mt-6">
          <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <ClipboardList className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">No tasks found</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mt-1">Create a task in a project to get started</p>
        </div>
      ) : (
        /* Task Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-200 flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                {statusBadge(task.status)}
                {task.priority === "High" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase tracking-wide">
                    <AlertTriangle className="w-3 h-3" /> High
                  </span>
                )}
              </div>

              <h3 className="text-base font-black text-slate-800 mb-2 uppercase tracking-tight line-clamp-1 group-hover:text-amber-600 transition-colors">
                {task.taskName || "Untitled Task"}
              </h3>

              <p className={`text-xs mb-4 line-clamp-2 border-l-2 border-slate-100 pl-2 ${task.description ? 'text-slate-500' : 'text-slate-400 italic'}`}>
                {task.description || "No additional details available"}
              </p>

              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                    {task.assignedTo ? (
                      <span className="text-[10px] font-bold">
                        {(task.assignedTo.name || task.assignedTo).charAt(0)}
                      </span>
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wide truncate max-w-[100px] ${task.assignedTo ? 'text-slate-600' : 'text-slate-400'}`}>
                    {task.assignedTo ? (task.assignedTo.name || task.assignedTo) : "Unassigned"}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  <Clock className="w-3 h-3" />
                  <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not Scheduled"}</span>
                </div>
              </div>

              <div className="mt-2 text-right">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  {task.projectId?.name || "No Project"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Tasks;
