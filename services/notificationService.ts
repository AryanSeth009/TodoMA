import PushNotification from 'react-native-push-notification';
import { Task } from '@/types/task';

class NotificationService {
  private isConfigured = false;

  configure() {
    if (this.isConfigured) return;
    
    try {
      PushNotification.configure({
        onRegister: function(token) {
          console.log('TOKEN:', token);
        },
        onNotification: function(notification) {
          console.log('NOTIFICATION:', notification);
        },
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: false,
        requestPermissions: true,
      });
      this.isConfigured = true;
    } catch (error) {
      console.error('Error configuring PushNotification:', error);
    }
  }

  scheduleTaskNotification(task: Task) {
    if (!task.endTime) return;

    const endTime = new Date(task.endTime);
    const twoHoursBefore = new Date(endTime.getTime() - 2 * 60 * 60 * 1000);
    const now = new Date();

    if (twoHoursBefore > now) {
      try {
        PushNotification.localNotificationSchedule({
          title: 'Task Deadline Approaching',
          message: `Task "${task.title}" is due in 2 hours`,
          date: twoHoursBefore,
          allowWhileIdle: true,
          channelId: 'task-notifications',
          id: task.id,
        });
      } catch (error) {
        console.error('Error scheduling task notification:', error);
      }
    }
  }

  scheduleDailySummaryNotification() {
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      21,
      0,
      0
    );

    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    try {
      PushNotification.localNotificationSchedule({
        title: 'Daily Task Summary',
        message: 'Check your task completion for today!',
        date: scheduledTime,
        allowWhileIdle: true,
        channelId: 'task-notifications',
        id: 'daily-summary',
        repeatType: 'day',
      });
    } catch (error) {
      console.error('Error scheduling daily summary:', error);
    }
  }

  sendDailySummaryNotification(completedTasks: number, totalTasks: number, username: string) {
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const message = `Hey ${username}! You completed ${completedTasks} out of ${totalTasks} tasks today (${completionRate}% completion rate). Keep up the good work!`;

    try {
      PushNotification.localNotification({
        title: 'Daily Task Summary',
        message: message,
        channelId: 'task-notifications',
        id: 'daily-summary',
      });
    } catch (error) {
      console.error('Error sending daily summary:', error);
    }
  }

  cancelTaskNotification(taskId: string) {
    try {
      PushNotification.cancelLocalNotification(taskId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  createNotificationChannel() {
    try {
      PushNotification.createChannel(
        {
          channelId: 'task-notifications',
          channelName: 'Task Notifications',
          channelDescription: 'Notifications for task deadlines and daily summaries',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    } catch (error) {
      console.error('Error creating notification channel:', error);
    }
  }
}

export const notificationService = new NotificationService(); 