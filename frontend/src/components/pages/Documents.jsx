import React from "react";
import { FileText, UploadCloud, Trash2 } from "lucide-react";

const documentsData = [
  { id: 1, name: "Blueprint-SiteA.pdf", project: "Site A", uploadedOn: "05 Sep 2025" },
  { id: 2, name: "Quotation-SiteB.xlsx", project: "Site B", uploadedOn: "08 Sep 2025" },
  { id: 3, name: "Permit-SiteC.pdf", project: "Site C", uploadedOn: "10 Sep 2025" },
  { id: 4, name: "Invoice-SiteD.pdf", project: "Site D", uploadedOn: "11 Sep 2025" },
];

const Documents = () => {
  return (
    <section className="px-6 md:px-12 py-10 bg-slate-200 min-h-screen font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Documents</h2>
          <p className="text-slate-500 mt-1">Manage and organize all project-related files.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-medium shadow-lg shadow-indigo-500/30">
          <UploadCloud className="w-5 h-5" /> Upload Document
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="min-w-full bg-white">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 tracking-wider uppercase">File Name</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 tracking-wider uppercase">Project</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 tracking-wider uppercase">Uploaded On</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600 tracking-wider uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {documentsData.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 flex items-center gap-2 font-medium text-slate-700">
                  <div className="bg-indigo-50 p-2 rounded text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  {doc.name}
                </td>
                <td className="py-4 px-6 text-slate-600">{doc.project}</td>
                <td className="py-4 px-6 text-slate-600 font-mono text-sm">{doc.uploadedOn}</td>
                <td className="py-4 px-6">
                  <button className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-medium text-sm px-3 py-1 rounded-lg hover:bg-rose-50 transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};


export default Documents;
