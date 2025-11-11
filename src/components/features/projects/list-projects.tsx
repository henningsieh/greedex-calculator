"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Alert } from "@/components/ui/alert";
import { orpcQuery } from "@/lib/orpc/orpc";
import { formatDate } from "@/lib/utils";

function ListProjects() {
  const { data: projects, error } = useSuspenseQuery(
    orpcQuery.project.list.queryOptions(),
  );

  if (error) {
    return (
      <Alert variant="destructive">
        Error loading projects: {error.message}
      </Alert>
    );
  }

  return (
    <div>
      <h1>Projects</h1>
      {projects && projects.length > 0 ? (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.id}>
              <h2>{project.name}</h2>
              <p>Start: {formatDate(project.startDate)}</p>
              <p>End: {formatDate(project.endDate)}</p>
              <p>Location: {project.location}</p>
              <p>Country: {project.country}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects found.</p>
      )}
    </div>
  );
}

export default ListProjects;
