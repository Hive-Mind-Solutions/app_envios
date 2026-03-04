import { useState } from 'react';
import { mockAssignments, mockPeople, mockProjects } from '../mocks/data';
import { Avatar } from '../components/Avatar';
import { AssignmentStatusBadge } from '../components/StatusBadge';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { Link } from '@tanstack/react-router';
import type { AssignmentStatus } from '../types';

const STATUS_FILTERS: { label: string; value: AssignmentStatus | 'all' }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Propuestas', value: 'proposed' },
  { label: 'Confirmadas', value: 'confirmed' },
  { label: 'Rechazadas', value: 'rejected' },
];

export function AssignmentsPage() {
  const [filter, setFilter] = useState<AssignmentStatus | 'all'>('all');

  const filtered = mockAssignments.filter(a => filter === 'all' || a.status === filter);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Asignaciones</h1>
        <p className="text-gray-500 mt-1">{mockAssignments.length} asignaciones en total</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Persona</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Proyecto</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Carga</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Periodo</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Match</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(assignment => {
              const person = mockPeople.find(p => p.id === assignment.personId);
              const project = mockProjects.find(p => p.id === assignment.projectId);
              if (!person || !project) return null;

              return (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={person.avatarInitials} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{person.name}</p>
                        <p className="text-xs text-gray-400">{person.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: project.id }}
                      className="font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {project.name}
                    </Link>
                    <p className="text-xs text-gray-400">{project.client}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-bold text-gray-900">{assignment.workloadPercent}%</span>
                    <span className="text-gray-400 text-xs"> /sem</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {assignment.startDate}<br />{assignment.endDate}
                  </td>
                  <td className="px-5 py-3">
                    <MatchScoreBadge score={assignment.matchScore} />
                  </td>
                  <td className="px-5 py-3">
                    <AssignmentStatusBadge status={assignment.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">No hay asignaciones con este filtro.</p>
        )}
      </div>
    </div>
  );
}
