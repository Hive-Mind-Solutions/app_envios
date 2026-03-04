import type { ProjectStatus, AssignmentStatus } from '../types';

const PROJECT_STATUS_STYLES: Record<ProjectStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const ASSIGNMENT_STATUS_STYLES: Record<AssignmentStatus, string> = {
  proposed: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  proposed: 'Propuesto',
  confirmed: 'Confirmado',
  rejected: 'Rechazado',
};

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus;
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PROJECT_STATUS_STYLES[status]}`}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}

export function AssignmentStatusBadge({ status }: AssignmentStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ASSIGNMENT_STATUS_STYLES[status]}`}>
      {ASSIGNMENT_STATUS_LABELS[status]}
    </span>
  );
}
