import ProjectHeader from "../ProjectHeader/ProjectHeader";
import MaterialsCard from "./MaterialsCard";
import TasksCard from "./TasksCard";
import CostsCard from "./CostsCard";
import TeamCard from "./TeamCard";
import IssuesCard from "./IssuesCard";
import LogsCard from "./LogsCard";
import InvoicesCard from "./InvoicesCard";


const ProjectDetails = () => {
  return (
    <section className="px-6 md:px-12 py-10 space-y-8 bg-slate-200 min-h-screen transition-colors duration-300">
      <ProjectHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MaterialsCard materials={[]} />
        <TasksCard tasks={[]} />
        <CostsCard costs={[]} />
        <TeamCard workers={[]} />
        <IssuesCard issues={[]} />
        <LogsCard logs={[]} />
        <InvoicesCard payments={[]} />
      </div>
    </section>
  );
};

export default ProjectDetails;
