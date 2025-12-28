import { useState, useEffect } from "react";
import { BookOpen, Pencil, Trash2, StickyNote } from "lucide-react";
import ProjectCard from "./ProjectCard";
import AddLogModal from "../common/AddLogModal";
import { useParams } from "react-router-dom";

const LogsCard = () => {
  const { id: projectId } = useParams();
  const [logs, setLogs] = useState([]);
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [isEditingLog, setIsEditingLog] = useState(null);

  // Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/logs/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLogs();
  }, [projectId]);

  const handleAddLog = (newLog) => {
    setLogs((prev) => [...prev, newLog]);
    setIsAddingLog(false);
  };

  const handleEditLog = (updatedLog) => {
    setLogs((prev) => prev.map((l) => (l._id === updatedLog._id ? updatedLog : l)));
    setIsEditingLog(null);
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm("Delete this log?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/logs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete log");
      setLogs((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete ❌");
    }
  };

  return (
    <>
      <ProjectCard
        title="Daily Logs"
        icon={<BookOpen className="w-4 h-4" />}
        onAdd={() => setIsAddingLog(true)}
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 border border-slate-100 rounded-lg border-dashed">
            <StickyNote className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">No logs recorded</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {logs.map((log) => (
              <div
                key={log._id}
                className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all group"
              >
                {/* Left: Date + Note */}
                <div className="flex-1 min-w-0 truncate">
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-tight mr-2">{log.date}: </span>
                  <span className="text-slate-600 text-sm font-medium truncate">{log.note}</span>
                </div>

                {/* Right: Edit/Delete */}
                <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setIsEditingLog(log)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors"
                    aria-label="Edit Log"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteLog(log._id)}
                    className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    aria-label="Delete Log"
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
      {isAddingLog && (
        <AddLogModal
          projectId={projectId}
          onClose={() => setIsAddingLog(false)}
          onSave={handleAddLog}
        />
      )}
      {isEditingLog && (
        <AddLogModal
          projectId={projectId}
          log={isEditingLog}
          onClose={() => setIsEditingLog(null)}
          onSave={handleEditLog}
        />
      )}
    </>
  );
};

export default LogsCard;
