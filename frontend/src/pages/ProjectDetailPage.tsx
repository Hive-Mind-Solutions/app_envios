import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Calendar, Building2, Target } from 'lucide-react';
import { mockProjects, mockAssignments, mockPeople } from '../mocks/data';
import { ProjectStatusBadge, AssignmentStatusBadge } from '../components/StatusBadge';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { Avatar } from '../components/Avatar';

export function ProjectDetailPage() {
  const { projectId } = useParams({ from: '/projects/$projectId' });
  const project = mockProjects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Proyecto no encontrado.</p>
        <Link to="/projects" className="text-indigo-600 text-sm mt-2 inline-block">← Volver</Link>
      </div>
    );
  }

  const assignments = mockAssignments.filter(a => a.projectId === project.id);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Proyectos
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
          <ProjectStatusBadge status={project.status} />
        </div>
        <p className="text-gray-500 text-sm mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-gray-400" />
            {project.client}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            {project.startDate} → {project.endDate}
          </span>
        </div>
      </div>

      {/* Profile Needs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" /> Perfiles necesarios
        </h2>
        <div className="space-y-3">
          {project.profileNeeds.map((need, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{need.role}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {need.requiredSkills.map(skill => (
                    <span key={skill} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-indigo-600">{need.workloadPercent}%</p>
                <p className="text-xs text-gray-400">carga/semana</p>
              </div>
              <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
                {need.minLevel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Asignaciones ({assignments.length})
        </h2>

        {assignments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No hay asignaciones para este proyecto.</p>
        ) : (
          <div className="space-y-3">
            {assignments.map(assignment => {
              const person = mockPeople.find(p => p.id === assignment.personId);
              if (!person) return null;

              return (
                <div key={assignment.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <Avatar initials={person.avatarInitials} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{person.name}</p>
                    <p className="text-xs text-gray-500">{person.role}</p>
                    {assignment.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 italic">{assignment.notes}</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-gray-900">{assignment.workloadPercent}%</p>
                    <p className="text-xs text-gray-400">carga</p>
                  </div>
                  <MatchScoreBadge score={assignment.matchScore} />
                  <AssignmentStatusBadge status={assignment.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
