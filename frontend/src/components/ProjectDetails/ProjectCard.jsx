import { Plus } from "lucide-react";

const ProjectCard = ({ title, icon, onAdd, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col hover:shadow-md transition-shadow duration-300">
    <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
      <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
        <span className="p-1.5 bg-white border border-slate-200 rounded text-amber-500 shadow-sm">
          {icon}
        </span>
        {title}
      </h3>
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1 bg-white text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-amber-600 hover:border-amber-500 border border-slate-200 text-xs font-bold uppercase tracking-wide shadow-sm transition-all"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      )}
    </div>
    <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[400px]">
      {children}
    </div>
  </div>
);

export default ProjectCard;
