import { Task, ScheduledTask } from '@/types/task';
import { colors } from '@/styles/colors';

// Team members
const teamMembers = [
  {
    id: 'mem1',
    name: 'Alice Cooper',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'mem2',
    name: 'Bob Smith',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'mem3',
    name: 'Charlie Davis',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'mem4',
    name: 'Diana Evans',
    avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'mem5',
    name: 'Edward Franco',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
];

export const ongoingTasks: Task[] = [
  {
    id: 'task1',
    title: 'Wallet App Design',
    startTime: '2:30 PM',
    endTime: '7:00 PM',
    team: [teamMembers[0], teamMembers[1], teamMembers[2]],
    progress: 46,
    color: colors.categoryLavender,
    daysRemaining: 6,
    categoryId: 'cat2',
  },
  {
    id: 'task2',
    title: 'Dashboard & Mobile App',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    team: [teamMembers[1], teamMembers[3], teamMembers[0], teamMembers[4]],
    progress: 72,
    color: colors.categoryPeach,
    daysRemaining: 4,
    categoryId: 'cat2',
  },
];

export const scheduledTasks: ScheduledTask[] = [
  {
    id: 'schedTask1',
    title: 'Website design with responsive',
    time: '10:00 AM',
    team: [teamMembers[0], teamMembers[2], teamMembers[3], teamMembers[4]],
    color: colors.categoryPeach,
    hasCall: true,
    categoryId: 'cat3',
  },
  {
    id: 'schedTask2',
    title: 'Mobile Wireframing',
    time: '11:30 AM',
    team: [teamMembers[1], teamMembers[0], teamMembers[2]],
    color: colors.categoryMint,
    hasCall: true,
    categoryId: 'cat2',
  },
  {
    id: 'schedTask3',
    title: 'Meeting with client',
    time: '12:30 PM',
    team: [teamMembers[0], teamMembers[3]],
    color: colors.categoryLavender,
    hasCall: true,
    categoryId: 'cat3',
  },
  {
    id: 'schedTask4',
    title: 'Finance Dashboard',
    time: '2:00 PM',
    team: [teamMembers[0], teamMembers[1], teamMembers[2], teamMembers[3], teamMembers[4]],
    color: colors.categoryBlue,
    hasCall: false,
    categoryId: 'cat4',
  },
];