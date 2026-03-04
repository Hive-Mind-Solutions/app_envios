import { mockPeople, mockAssignments } from '../mocks/data';
import { Avatar } from '../components/Avatar';
import { Mail } from 'lucide-react';
import type { SkillLevel } from '../types';

const LEVEL_COLORS: Record<SkillLevel, string> = {
  junior: 'bg-gray-100 text-gray-600',
  mid: 'bg-blue-100 text-blue-700',
  senior: 'bg-purple-100 text-purple-700',
};

function AvailabilityBar({ percent }: { percent: number }) {
  const color = percent >= 75 ? 'bg-green-500' : percent >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600 w-8 text-right">{percent}%</span>
    </div>
  );
}

export function PeoplePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Personas</h1>
        <p className="text-gray-500 mt-1">{mockPeople.length} personas en el equipo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockPeople.map(person => {
          const activeAssignments = mockAssignments.filter(
            a => a.personId === person.id && a.status === 'confirmed'
          );

          return (
            <div key={person.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar initials={person.avatarInitials} size="lg" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{person.name}</p>
                  <p className="text-xs text-gray-500">{person.role}</p>
                  <a href={`mailto:${person.email}`} className="text-xs text-indigo-600 flex items-center gap-1 mt-0.5 hover:text-indigo-800">
                    <Mail className="w-3 h-3" /> {person.email}
                  </a>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1.5">Disponibilidad semanal</p>
                <AvailabilityBar percent={person.availabilityPercent} />
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1.5">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {person.skills.map(skill => (
                    <span
                      key={skill.name}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${LEVEL_COLORS[skill.level]}`}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              {activeAssignments.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">{activeAssignments.length} proyecto(s) activo(s)</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
