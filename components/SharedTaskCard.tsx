import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Task } from '@/types/task';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react-native';

interface SharedTaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, newStatus: 'To-do' | 'In Progress' | 'Done') => void;
  currentUserRole?: 'Admin' | 'Member' | 'Viewer' | 'Guest'; // New prop for current user's role
  onSelectTask: (task: Task) => void; // New prop for selecting a task
}

const SharedTaskCard = ({ task, onUpdateStatus, currentUserRole, onSelectTask }: SharedTaskCardProps) => {
  const { colors } = useTheme();

  const getStatusColor = (status: 'To-do' | 'In Progress' | 'Done') => {
    switch (status) {
      case 'To-do':
        return colors.textSecondary;
      case 'In Progress':
        return colors.warning;
      case 'Done':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const getNextStatus = (currentStatus: 'To-do' | 'In Progress' | 'Done') => {
    switch (currentStatus) {
      case 'To-do':
        return 'In Progress';
      case 'In Progress':
        return 'Done';
      case 'Done':
        return 'To-do'; // Allow cycling back for now, adjust as needed
      default:
        return 'To-do';
    }
  };

  return (
    <TouchableOpacity onPress={() => onSelectTask(task)} style={styles.touchableCard}> // Make the entire card touchable
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{task.title}</Text>
          <TouchableOpacity
            onPress={() => onUpdateStatus(task.id, getNextStatus(task.status))}
            disabled={currentUserRole === 'Viewer' || currentUserRole === 'Guest'}
          >
            {task.status === 'Done' ? (
              <CheckCircle size={24} color={getStatusColor(task.status)} />
            ) : (
              <Circle size={24} color={getStatusColor(task.status)} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.owner, { color: colors.textSecondary }]}>
          Owner: {task.owner?.name || 'Unassigned'}
        </Text>
        {task.deadline && (
          <Text style={[styles.deadline, { color: colors.textSecondary }]}>
            Deadline: {new Date(task.deadline).toLocaleDateString()}
          </Text>
        )}
        <Text style={[styles.priority, { color: getStatusColor(task.priority) }]}>
          Priority: {task.priority}
        </Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            Status: <Text style={{ color: getStatusColor(task.status), fontWeight: 'bold' }}>{task.status}</Text>
          </Text>
          <TouchableOpacity
            onPress={() => onUpdateStatus(task.id, getNextStatus(task.status))}
            disabled={currentUserRole === 'Viewer' || currentUserRole === 'Guest'}
          >
            <ArrowRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  owner: {
    fontSize: 14,
    marginBottom: 4,
  },
  deadline: {
    fontSize: 14,
    marginBottom: 4,
  },
  priority: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
  },
  touchableCard: {
    width: '100%',
  },
});

export default SharedTaskCard;
