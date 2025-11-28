import ProjectCard from "@/components/features/projects/project-card";
import type { ProjectType } from "@/components/features/projects/types";

interface ProjectsGridProps {
  sortedProjects: Array<ProjectType>;
}

function ProjectsGrid({ sortedProjects }: ProjectsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedProjects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default ProjectsGrid;
