import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddProjectModal from "../common/AddProjectModal";
import {
  Building2,
  Download,
  MapPin,
  Calendar,
  UserSquare2,
  HardHat,
  Plus
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/projects`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  const handleAddProject = (newProject) => {
    setProjects((prev) => [...prev, newProject]);
  };

  const handleViewProject = (project) => {
    navigate(`/projects/${project._id}`);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("All Projects Report", 14, 16);

    const tableColumn = ["Project Name", "Location", "Manager", "Deadline", "Budget", "Progress"];
    const tableRows = [];

    projects.forEach(project => {
      const projectData = [
        project.name,
        project.location,
        project.manager,
        project.deadline,
        project.plannedBudget,
        `${project.progress}%`
      ];
      tableRows.push(projectData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20
    });

    doc.save("projects_report.pdf");
  };

  return (
    <section className="px-6 md:px-12 py-8 space-y-8 bg-slate-200 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-300 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Management</span>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {projects.length} Active Sites
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 uppercase tracking-tight">
            Projects <span className="text-amber-600">Overview</span>
          </h2>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <button
            onClick={generatePDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-all font-bold shadow-sm text-sm uppercase tracking-wide"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <button
            onClick={() => setIsAddingProject(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-900/20 text-sm uppercase tracking-wide border border-transparent hover:border-amber-500/50"
          >
            <Plus className="h-4 w-4 text-amber-500" /> Add Project
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div
            key={project._id}
            className={`group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between border-l-4 ${project.progress === 100 ? 'border-l-emerald-500' : 'border-l-amber-500'
              }`}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg group-hover:scale-105 transition-transform ${project.progress === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                  <Building2 className="h-6 w-6" />
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${project.progress === 100
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                  }`}>
                  {project.progress === 100 ? "Completed" : "Active"}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-2 line-clamp-1 group-hover:text-slate-600 transition-colors uppercase tracking-tight">
                {project.name}
              </h3>

              <div className="space-y-2.5 mb-6 pt-2 border-t border-slate-100">
                <p className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-slate-400" /> {project.location}
                </p>
                <p className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                  <UserSquare2 className="w-4 h-4 text-slate-400" /> {project.manager}
                </p>
                <p className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                  <Calendar className="w-4 h-4 text-slate-400" /> {project.deadline}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-700 uppercase tracking-wide">Completion</span>
                  <span className="font-bold text-slate-900">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative ${project.progress >= 75
                        ? "bg-emerald-500"
                        : project.progress >= 40
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                    style={{ width: `${project.progress || 0}%` }}
                  >
                    {/* Striped pattern overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-50"></div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleViewProject(project)}
              className="mt-2 w-full bg-white text-slate-700 py-2.5 rounded-lg font-bold hover:bg-slate-50 transition-colors border border-slate-200 hover:border-slate-300 shadow-sm text-sm uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <HardHat className="w-4 h-4 text-amber-500" /> Site Details
            </button>
          </div>
        ))}
      </div>

      {isAddingProject && (
        <AddProjectModal onClose={() => setIsAddingProject(false)} onSave={handleAddProject} />
      )}
    </section>
  );
};

export default Projects;
