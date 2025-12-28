import React, { useState, useEffect } from "react";
import { ClipboardList, X, CheckCircle2, AlertOctagon, User } from "lucide-react";
import CustomSelect from "./CustomSelect";
import { userApi } from "../../services/api";

const AddTaskModal = ({ task, onClose, onSave, projectId }) => {
  const [form, setForm] = useState({
    taskName: "",
    description: "",
    status: "Pending",
    priority: "Medium",
    dueDate: "",
    assignedTo: "",
    project: projectId
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userApi.getUsers();
        // Handle different response structures (array or object with users array)
        const userList = Array.isArray(response.data) ? response.data : response.data.users || [];
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // If editing, load task into form
  useEffect(() => {
    if (task) {
      setForm({
        taskName: task.taskName || "",
        description: task.description || "",
        status: task.status || "Pending",
        priority: task.priority || "Medium",
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : "",
        assignedTo: task.assignedTo?._id || task.assignedTo || "",
        project: task.project || projectId
      });
    }
  }, [task, projectId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.taskName) {
      alert("Task Name is required ❌");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        task
          ? `${import.meta.env.VITE_BACKEND_URL}/api/tasks/${task._id}`
          : `${import.meta.env.VITE_BACKEND_URL}/api/tasks/${projectId}`,
        {
          method: task ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            assignedTo: form.assignedTo || undefined // Send undefined if empty to treat as unassigned
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save task");
      const data = await response.json();

      onSave(data); // Pass updated/new task back to parent
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Error saving task ❌");
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
              <ClipboardList className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {task ? "Update Task" : "New Task"}
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
            {/* Task Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Task Name
              </label>
              <input
                type="text"
                name="taskName"
                value={form.taskName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal uppercase tracking-wide"
                placeholder="ENTER TASK TITLE"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 resize-none"
                placeholder="Add task details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <CustomSelect
                  label="Status"
                  value={form.status}
                  onChange={(value) => setForm({ ...form, status: value })}
                  options={[
                    { value: "Pending", label: "Pending" },
                    { value: "In Progress", label: "In Progress" },
                    { value: "Completed", label: "Completed" }
                  ]}
                  icon={CheckCircle2}
                />
              </div>

              {/* Priority */}
              <div>
                <CustomSelect
                  label="Priority"
                  value={form.priority}
                  onChange={(value) => setForm({ ...form, priority: value })}
                  options={[
                    { value: "Medium", label: "Medium" },
                    { value: "High", label: "High" },
                    { value: "Low", label: "Low" }
                  ]}
                  icon={AlertOctagon}
                />
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <CustomSelect
                label="Assign To"
                value={form.assignedTo}
                onChange={(value) => setForm({ ...form, assignedTo: value })}
                options={[
                  { value: "", label: "Unassigned" },
                  ...users.map(user => ({
                    value: user._id,
                    label: `${user.name} (${user.role})`
                  }))
                ]}
                icon={User}
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-all text-xs font-bold uppercase tracking-wider"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-slate-900/20"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
