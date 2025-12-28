import { Pencil, Trash2, MapPin, Calendar, UserSquare2, IndianRupee, HardHat } from "lucide-react";

const ProjectDetails = ({ project, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start gap-6 border-l-4 border-amber-500 transition-all duration-300">
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-slate-900 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">Project ID: {project._id?.slice(-6) || 'N/A'}</span>
          <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
            Active Site
          </span>
        </div>

        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">{project.name}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm pt-2 border-t border-slate-100 mt-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
            <p className="flex items-center gap-2 text-slate-700 font-bold">
              <MapPin className="w-4 h-4 text-amber-500" /> {project.location}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Manager</p>
            <p className="flex items-center gap-2 text-slate-700 font-bold">
              <UserSquare2 className="w-4 h-4 text-amber-500" /> {project.manager}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deadline</p>
            <p className="flex items-center gap-2 text-slate-700 font-bold">
              <Calendar className="w-4 h-4 text-amber-500" /> {project.deadline}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Budget</p>
            <p className="flex items-center gap-2 text-slate-700 font-bold">
              <IndianRupee className="w-4 h-4 text-amber-500" /> ₹{project.plannedBudget.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
            <HardHat className="w-4 h-4 text-slate-400" /> Site Description
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed">{project.description}</p>
        </div>
      </div>

      <div className="flex gap-2 min-w-max">
        <button
          onClick={onEdit}
          className="bg-white text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 font-bold border border-slate-200 shadow-sm text-sm uppercase tracking-wide"
        >
          <Pencil className="w-4 h-4 text-amber-500" /> <span className="hidden sm:inline">Modify</span>
        </button>
        <button
          onClick={onDelete}
          className="bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-rose-600 hover:border-rose-600 shadow-md transition-all flex items-center gap-2 font-bold border border-slate-900 text-sm uppercase tracking-wide"
        >
          <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Remove</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectDetails;
