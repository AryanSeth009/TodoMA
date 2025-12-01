import { View, StyleSheet, Text } from 'react-native';
import TimelineItem from './TimelineItem';
import { useTaskStore } from '@/store/taskStore';
import { useEffect, useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '../styles/typography'; // Corrected import path

export default function TimelineTasks() {
  const { colors } = useTheme(); // Remove typography from destructuring
  const typography = useMemo(() => createTypography(colors), [colors]); // Initialize typography
  const tasks = useTaskStore((state) => state.tasks);
  const completedTasks = useTaskStore((state) => state.completedTasks);
  const scheduledTasks = useTaskStore((state) => state.scheduledTasks);
  const syncTasksWithBackend = useTaskStore((state) => state.syncTasksWithBackend);
  const selectedDate = useTaskStore((state) => state.selectedDate);

  // Force a sync with backend when component mounts
  useEffect(() => {
    console.log('TimelineTasks: Syncing tasks with backend');
    syncTasksWithBackend();
  }, [selectedDate]);

  // Get the selected date object
  const selectedDateObj = useMemo(() => {
    // If selectedDate is provided, use it, otherwise use today
    const date = selectedDate ? new Date(selectedDate) : new Date();
    // Reset time to midnight for date comparison
    date.setHours(0, 0, 0, 0);
    return date;
  }, [selectedDate]);
  
  // Format the selected date for display
  const formattedDate = useMemo(() => {
    return selectedDateObj.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });
  }, [selectedDateObj]);
  
  // Debug logs
  useEffect(() => {
    console.log(`TimelineTasks: Rendering with ${tasks.length} active tasks, ${completedTasks.length} completed tasks, ${scheduledTasks.length} scheduled tasks for ${formattedDate}`);
    console.log('TimelineTasks: Current selectedDate (timestamp):', selectedDate);
    console.log('TimelineTasks: Active tasks:', JSON.stringify(tasks, null, 2));
    console.log('TimelineTasks: Completed tasks:', JSON.stringify(completedTasks, null, 2));
    console.log('TimelineTasks: Scheduled tasks:', JSON.stringify(scheduledTasks, null, 2));
  }, [tasks, completedTasks, scheduledTasks, formattedDate, selectedDate]);

  // Generate time slots from 9 AM to 6 PM
  const hours = useMemo(() => {
    const timeSlots: string[] = [];
    // Start at 9 AM and go to 6 PM with 30 minute intervals
    for (let i = 9; i <= 18; i++) {
      const hour = i < 12 
        ? `${i}:00 AM` 
        : i === 12 
          ? `${i}:00 PM` 
          : `${i-12}:00 PM`;
      
      const halfHour = i < 12 
        ? `${i}:30 AM` 
        : i === 12 
          ? `${i}:30 PM` 
          : `${i-12}:30 PM`;
      
      timeSlots.push(hour);
      timeSlots.push(halfHour);
    }
    return timeSlots;
  }, []);
  
  // Group tasks by hour
  const tasksByHour = useMemo(() => {
    const groupedTasks: Record<string, any[]> = {};
    
    // Initialize empty arrays for each time slot
    hours.forEach(hour => {
      groupedTasks[hour] = [];
    });
  
  // Helper function to normalize time format for comparison
  const normalizeTimeFormat = (timeStr: string): string => {
    // Handle various time formats and normalize them
    if (!timeStr) return '';
    
    // Convert to uppercase for consistency
    const upperTimeStr = timeStr.toUpperCase();
    
    // Check if it already has AM/PM
    if (upperTimeStr.includes('AM') || upperTimeStr.includes('PM')) {
      return upperTimeStr;
    }
    
    // If it's in 24-hour format, convert to 12-hour with AM/PM
    const timeParts = upperTimeStr.split(':');
    if (timeParts.length >= 2) {
      const hour = parseInt(timeParts[0], 10);
      const minute = parseInt(timeParts[1], 10);
      
      if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
        return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
      }
    }
    
    return upperTimeStr; // Return original if we can't parse it
  };
  
    // Helper function to check if a task is for the selected date
    const isTaskForSelectedDate = (task: any) => {
      const normalizeDate = (dateToNormalize: string | number | Date) => {
        const d = new Date(dateToNormalize);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      };

      const normalizedSelectedDate = selectedDateObj.getTime();

      // Completed tasks should show on their completedAt date
      if (task.completed && task.completedAt) {
        return normalizeDate(task.completedAt) === normalizedSelectedDate;
      }

      // Scheduled tasks should show on the selected date. Their time will be used for grouping.
      if (task.scheduled) {
        // Assuming scheduled tasks are meant for the 'selectedDate' in general
        // and not tied to a specific date field within the task object itself beyond 'time'.
        // This means if a scheduled task has a time, it should appear on the selected day.
        // If there was a 'date' field for scheduled tasks, we'd use that here.
        // For now, if the selectedDate matches the current date being rendered, show all scheduled tasks.
        // The grouping by hour will handle their specific time.
        return true; // Simplified: all scheduled tasks from the store will be considered
      }

      // Active tasks should show on their startTime or createdAt date
      if (task.startTime) {
        return normalizeDate(task.startTime) === normalizedSelectedDate;
      }
      if (task.createdAt) {
        return normalizeDate(task.createdAt) === normalizedSelectedDate;
      }

      // Fallback: if no specific date field, assume it's for today (if selectedDate is today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return normalizedSelectedDate === today.getTime();
    };
    
    // Filter tasks for the selected date and add them to the appropriate time slots
    
    // Combine all tasks for easier processing, ensuring uniqueness
    const allTasks = [...tasks, ...scheduledTasks, ...completedTasks]
      .filter((task, index, self) => 
        index === self.findIndex(t => t.id === task.id) // Use task.id for uniqueness
      );
    console.log('TimelineTasks: All tasks before date filter:', JSON.stringify(allTasks, null, 2));
    const filteredTasks = allTasks.filter(isTaskForSelectedDate);
    console.log('TimelineTasks: All tasks AFTER date filter:', JSON.stringify(filteredTasks, null, 2));

    filteredTasks.forEach(task => {
      let timeToUse;
      if (task.completed && task.completedAt) {
        // For completed tasks, use completedAt
        timeToUse = task.completedAt;
      } else if (task.scheduled) {
        // For scheduled tasks, use task.time
        timeToUse = task.time;
      } else {
        // For active tasks, use startTime
        timeToUse = task.startTime;
      }

      if (!timeToUse) return;

      const normalizedTime = normalizeTimeFormat(timeToUse);
      const matchingHour = hours.find(hour =>
        normalizedTime.includes(hour) || hour.includes(normalizedTime)
      );

      if (matchingHour && groupedTasks[matchingHour]) {
        groupedTasks[matchingHour].push(task);
      } else {
        const defaultHour = '9:00 AM';
        groupedTasks[defaultHour].push(task);
      }
    });
    
    return groupedTasks;
  }, [tasks, completedTasks, scheduledTasks, hours, selectedDateObj]);
  
  // Count total tasks for the day
  const totalTasks = useMemo(() => {
    return Object.values(tasksByHour).reduce((count, tasks) => count + tasks.length, 0);
  }, [tasksByHour]);

  return (
    <View style={styles.container}>
      {/* Date and task count header */}
      <View style={styles.dateHeader}>
        <Text style={[typography.heading, { color: colors.textPrimary }]}>
          {formattedDate}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} today
        </Text>
      </View>
      
      {/* Timeline */}
      {totalTasks > 0 ? (
        hours.map((hour, index) => (
          <TimelineItem 
            key={hour} 
            time={hour} 
            isLast={index === hours.length - 1} 
            tasks={tasksByHour[hour]} 
          />
        ))
      ) : (
        <Text style={[typography.body, styles.emptyMessage]}>
          No tasks scheduled for this date
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingBottom: 20,
  },
  dateHeader: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40,
    color: '#888',
  }
});