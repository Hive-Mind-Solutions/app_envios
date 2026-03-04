import { Link } from '@tanstack/react-router';
import { Plus, Calendar, Users } from 'lucide-react';
import { mockProjects, mockAssignments } from '../mocks/data';
import { ProjectStatusBadge } from '../components/StatusBadge';

export function ProjectsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-500 mt-1">{mockProjects.length} proyectos en total</p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockProjects.map(project => {
          const assignmentCount = mockAssignments.filter(a => a.projectId === project.id).length;

          return (
            <Link
              key={project.id}
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">{project.name}</h2>
                <ProjectStatusBadge status={project.status} />
              </div>

              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>

              <div className="text-xs font-medium text-gray-400 mb-3">{project.client}</div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {project.startDate} → {project.endDate}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {assignmentCount} asignaciones
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {project.profileNeeds.map((need, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs">
                    {need.role} · {need.workloadPercent}%
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
