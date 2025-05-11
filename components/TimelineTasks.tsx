import { View, StyleSheet, Text } from 'react-native';
import TimelineItem from './TimelineItem';
import { useTaskStore } from '@/store/taskStore';
import { useEffect, useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function TimelineTasks() {
  const { colors, typography } = useTheme();
  const tasks = useTaskStore((state) => state.tasks);
  const completedTasks = useTaskStore((state) => state.completedTasks);
  const scheduledTasks = useTaskStore((state) => state.scheduledTasks);
  const syncTasksWithBackend = useTaskStore((state) => state.syncTasksWithBackend);
  const selectedDate = useTaskStore((state) => state.selectedDate);

  // Force a sync with backend when component mounts
  useEffect(() => {
    console.log('TimelineTasks: Syncing tasks with backend');
    syncTasksWithBackend();
  }, []);

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
  }, [tasks, completedTasks, scheduledTasks, formattedDate]);

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
      // If task has a date field, use it
      if (task.date) {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === selectedDateObj.getTime();
      }
      
      // If task has a completedAt field, check if it was completed on the selected date
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate.getTime() === selectedDateObj.getTime();
      }
      
      // Default to showing tasks for today if no date information
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDateObj.getTime() === today.getTime();
    };
    
    // Filter tasks for the selected date and add them to the appropriate time slots
    
    // Add scheduled tasks for the selected date
    scheduledTasks.forEach(task => {
      if (isTaskForSelectedDate(task)) {
        const normalizedTime = normalizeTimeFormat(task.time);
        // Find the closest time slot
        const matchingHour = hours.find(hour => 
          normalizedTime.includes(hour) || hour.includes(normalizedTime));
        
        if (matchingHour && groupedTasks[matchingHour]) {
          groupedTasks[matchingHour].push(task);
        } else {
          // If no exact match, try to find the closest time slot
          const defaultHour = '9:00 AM';
          groupedTasks[defaultHour].push(task);
        }
      }
    });
    
    // Add regular tasks for the selected date
    tasks.forEach(task => {
      if (isTaskForSelectedDate(task)) {
        const normalizedTime = normalizeTimeFormat(task.startTime);
        // Find the closest time slot
        const matchingHour = hours.find(hour => 
          normalizedTime.includes(hour) || hour.includes(normalizedTime));
        
        if (matchingHour && groupedTasks[matchingHour]) {
          groupedTasks[matchingHour].push(task);
        } else {
          // If no exact match, add to 9 AM as default
          const defaultHour = '9:00 AM';
          groupedTasks[defaultHour].push(task);
        }
      }
    });
    
    // Add completed tasks for the selected date (only those less than 1 month old)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    completedTasks.forEach(task => {
      // Skip tasks completed more than a month ago
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        if (completedDate <= oneMonthAgo) return;
        
        // Only include if it was completed on the selected date
        if (isTaskForSelectedDate(task)) {
          const normalizedTime = normalizeTimeFormat(task.startTime);
          // Find the closest time slot
          const matchingHour = hours.find(hour => 
            normalizedTime.includes(hour) || hour.includes(normalizedTime));
          
          if (matchingHour && groupedTasks[matchingHour]) {
            groupedTasks[matchingHour].push(task);
          } else {
            // If no exact match, add to 9 AM as default
            const defaultHour = '9:00 AM';
            groupedTasks[defaultHour].push(task);
          }
        }
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