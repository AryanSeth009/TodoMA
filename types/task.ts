export type Role = 'Admin' | 'Member' | 'Viewer' | 'Guest';

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: Role; // Add role to TeamMember
};

export type Team = {
  id: string;
  name: string;
  members: TeamMember[];
  owner: TeamMember;
};

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  inviterName: string;
  recipientEmail: string; // New field
}

export type Comment = {
  id: string;
  author: TeamMember; // Or just authorId: string, depending on how detailed we want to be
  text: string;
  createdAt: string | number | Date;
};

export type Attachment = {
  id: string;
  filename: string;
  uri: string; // URI to the file, could be a local path or a remote URL
  uploadedAt: string | number | Date;
};

export type Task = {
  id: Key | null | undefined;
  createdAt?: string | number | Date;
  _id?: string; // MongoDB _id
  localId?: string; // Client-side ID for offline tasks
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  deadline?: string; // Add deadline to Task type
  teamId?: string; // New field for team association
  team?: TeamMember[]; // Make team optional as not all tasks are team tasks
  owner?: TeamMember; // New field for shared tasks
  comments?: Comment[]; // New field for task comments
  attachments?: Attachment[]; // New field for task attachments
  progress: number; // 0-100
  color: string;
  daysRemaining: number;
  categoryId: string;
  completedAt?: string | number | Date;
  completed?: boolean;
  scheduled?: boolean;
  quick?: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'To-do' | 'In Progress' | 'Done'; // New status field
};

export type ScheduledTask = {
  id: string;
  title: string;
  time: string;
  teamId?: string; // Replace team with teamId
  color: string;
  hasCall: boolean;
  categoryId: string;
};