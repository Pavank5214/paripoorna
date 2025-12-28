import { FileText } from "lucide-react";
import ProjectCard from "./ProjectCard";

const DocumentsCard = ({ documents, onAdd }) => (
  <ProjectCard title="Documents" icon={<FileText className="w-5 h-5" />} onAdd={onAdd}>
    {documents.map((d, i) => (
      <div key={i} className="flex justify-between text-gray-700">
        <span>{d.name}</span>
        <span className="text-gray-500">{d.type}</span>
      </div>
    ))}
  </ProjectCard>
);

export default DocumentsCard;
