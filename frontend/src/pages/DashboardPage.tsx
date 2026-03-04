import { Link } from '@tanstack/react-router';
import { FolderKanban, Users, CalendarCheck, TrendingUp, ArrowRight } from 'lucide-react';
import { mockProjects, mockPeople, mockAssignments } from '../mocks/data';
import { ProjectStatusBadge } from '../components/StatusBadge';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { Avatar } from '../components/Avatar';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const activeProjects = mockProjects.filter(p => p.status === 'active');
  const pendingAssignments = mockAssignments.filter(a => a.status === 'proposed');
  const recentProjects = mockProjects.slice(0, 3);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general de proyectos y asignaciones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Proyectos activos" value={activeProjects.length} icon={FolderKanban} color="bg-indigo-500" />
        <StatCard label="Total proyectos" value={mockProjects.length} icon={TrendingUp} color="bg-purple-500" />
        <StatCard label="Personas disponibles" value={mockPeople.length} icon={Users} color="bg-blue-500" />
        <StatCard label="Asignaciones pendientes" value={pendingAssignments.length} icon={CalendarCheck} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Proyectos recientes</h2>
            <Link to="/projects" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentProjects.map(project => (
              <Link
                key={project.id}
                to="/projects/$projectId"
                params={{ projectId: project.id }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{project.name}</p>
                  <p className="text-xs text-gray-500">{project.client}</p>
                </div>
                <ProjectStatusBadge status={project.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Asignaciones por confirmar</h2>
            <Link to="/assignments" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingAssignments.map(assignment => {
              const person = mockPeople.find(p => p.id === assignment.personId);
              const project = mockProjects.find(p => p.id === assignment.projectId);
              if (!person || !project) return null;

              return (
                <div key={assignment.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <Avatar initials={person.avatarInitials} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{person.name}</p>
                    <p className="text-xs text-gray-500 truncate">{project.name} · {assignment.workloadPercent}%</p>
                  </div>
                  <MatchScoreBadge score={assignment.matchScore} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
