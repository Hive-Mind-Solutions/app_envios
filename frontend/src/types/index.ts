export type ProjectStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type AssignmentStatus = 'proposed' | 'confirmed' | 'rejected';
export type SkillLevel = 'junior' | 'mid' | 'senior';

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  skills: Skill[];
  availabilityPercent: number; // % disponible por semana
  avatarInitials: string;
}

export interface ProfileNeed {
  role: string;
  requiredSkills: string[];
  workloadPercent: number;
  minLevel: SkillLevel;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  profileNeeds: ProfileNeed[];
  createdAt: string;
}

export interface Assignment {
  id: string;
  projectId: string;
  personId: string;
  workloadPercent: number;
  startDate: string;
  endDate: string;
  status: AssignmentStatus;
  matchScore: number; // 0–100
  notes: string;
}
