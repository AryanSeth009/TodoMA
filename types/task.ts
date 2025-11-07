export type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type Task = {
  createdAt: string | number | Date;
  id: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  team: TeamMember[];
  progress: number; // 0-100
  color: string;
  daysRemaining: number;
  categoryId: string;
  completedAt?: string | number | Date;
  completed?: boolean;
  scheduled?: boolean;
  quick?: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type ScheduledTask = {
  id: string;
  title: string;
  time: string;
  team: TeamMember[];
  color: string;
  hasCall: boolean;
  categoryId: string;
};