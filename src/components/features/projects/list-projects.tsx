"use client";

import { useQuery } from "@tanstack/react-query";
import { orpcQuery } from "@/lib/orpc/orpc";
import { formatDate } from "@/lib/utils";

function ListProjects() {
  const {
    data: projects,
    isLoading,
    error,
  } = useQuery(orpcQuery.project.list.queryOptions());

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error loading projects: {error.message}</div>;
  }

  return (
    <div>
      <h1>Projects</h1>
      {projects && projects.length > 0 ? (
        <ul>
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
