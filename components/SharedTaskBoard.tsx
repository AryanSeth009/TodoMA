import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import CommentSection from './CommentSection'; // Import CommentSection
import AttachmentSection from './AttachmentSection'; // Import AttachmentSection
import SharedTaskCard from './SharedTaskCard'; // Import SharedTaskCard
import ActivityFeed from './ActivityFeed'; // Import ActivityFeed
import TeamStreakCard from './TeamStreakCard'; // Import TeamStreakCard
import TeamLeaderboard from './TeamLeaderboard'; // Import TeamLeaderboard
import TeamChat from './TeamChat'; // Import TeamChat
import { Attachment, Comment, TeamMember, Task, Team } from '@/types/task'; // Import Comment, TeamMember, Attachment, Task, and Team types
import { useTaskStore } from '@/store/taskStore';

interface SharedTaskBoardProps {
  team: Team; // New prop: the selected team
}

const SharedTaskBoard = ({ team }: SharedTaskBoardProps) => {
  const { colors } = useTheme();
  const addCommentToTask = useTaskStore((state) => state.addCommentToTask);
  const addAttachmentToTask = useTaskStore((state) => state.addAttachmentToTask);
  const removeAttachmentFromTask = useTaskStore((state) => state.removeAttachmentFromTask);
  const { tasks, updateTask, user: loggedInUser, completedTasks } = useTaskStore(); // Get completedTasks from store

  const currentUser: TeamMember = useMemo(() => {
    if (loggedInUser) {
      const member = team.members.find(m => m.id === loggedInUser.id || m.email === loggedInUser.email); // Check by ID first, then email
      return member ? { ...loggedInUser, id: member.id, role: member.role } : { ...loggedInUser, role: 'Guest' };
    }
    return { id: 'guest', name: 'Guest', email: 'guest@example.com', role: 'Guest' };
  }, [team, loggedInUser]);

  // State for the currently selected task for comments/attachments
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter for shared tasks belonging to the current team
  const sharedTasks = tasks.filter(task => task.teamId === team.id);

  // State for comments and attachments, initialized with data from selectedTask
  const [comments, setComments] = useState<Comment[]>(selectedTask?.comments || []);
  const [attachments, setAttachments] = useState<Attachment[]>(selectedTask?.attachments || []);

  useEffect(() => {
    setComments(selectedTask?.comments || []);
    setAttachments(selectedTask?.attachments || []);
  }, [selectedTask]);

  // Derive activities from tasks and team actions
  const teamActivities = useMemo(() => {
    const generatedActivities: { id: string; text: string; timestamp: string }[] = [];

    sharedTasks.forEach(task => {
      // Task creation activity
      if (task.createdAt) {
        generatedActivities.push({
          id: `activity_create_${task.id}`,
          text: `${task.owner?.name || 'A member'} added a new task: "${task.title}" to ${team.name}`,
          timestamp: task.createdAt,
        });
      }
      // Task status update activity
      if (task.status !== 'To-do' && task.createdAt) { // Assuming initial status is To-do, any other status is an update
        generatedActivities.push({
          id: `activity_status_${task.id}`,
          text: `${task.owner?.name || 'A member'} updated task "${task.title}" status to ${task.status} in ${team.name}`,
          timestamp: task.createdAt, // This might need a separate 'updatedAt' timestamp for accuracy
        });
      }
      // Task completion activity
      if (task.completed && task.completedAt) {
        generatedActivities.push({
          id: `activity_complete_${task.id}`,
          text: `${task.owner?.name || 'A member'} completed task: "${task.title}" in ${team.name}`,
          timestamp: task.completedAt,
        });
      }
    });

    // Sort activities by timestamp
    return generatedActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [sharedTasks, team.name]);

  // Derive Team Streak
  const { currentStreak, allMembersCompletedToday } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let membersCompletedToday = 0;

    team.members.forEach(member => {
      const memberCompletedTaskToday = completedTasks.some(task =>
        task.teamId === team.id &&
        task.owner?.id === member.id &&
        task.completedAt?.startsWith(today)
      );
      if (memberCompletedTaskToday) {
        membersCompletedToday++;
      }
    });

    const newAllMembersCompletedToday = membersCompletedToday === team.members.length;

    // This is a simplified streak logic. In a real app, streak would be persistent and calculated over days.
    // For now, we'll just mock a static streak and base 'allMembersCompletedToday' on current task completions.
    return {
      currentStreak: 5, // Static for now
      allMembersCompletedToday: newAllMembersCompletedToday,
    };
  }, [team.members, completedTasks, team.id]);

  // Derive Team Leaderboard
  const leaderboardData = useMemo(() => {
    const userStats: { [key: string]: { id: string; name: string; tasksCompleted: number; taskQuality: number; streakBehavior: number; xpEarned: number; speedOfCompletion: number; } } = {};

    team.members.forEach(member => {
      userStats[member.id] = {
        id: member.id,
        name: member.name,
        tasksCompleted: 0,
        taskQuality: 0,
        streakBehavior: 0,
        xpEarned: 0,
        speedOfCompletion: 0,
      };
    });

    sharedTasks.forEach(task => {
      const ownerId = task.owner?.id;
      if (ownerId && userStats[ownerId]) {
        if (task.status === 'Done') {
          userStats[ownerId].tasksCompleted += 1;
          userStats[ownerId].xpEarned += 10; // Example XP for completing a task
          // Add more complex logic for taskQuality, streakBehavior, speedOfCompletion here if needed
        }
      }
    });

    return Object.values(userStats).sort((a, b) => b.xpEarned - a.xpEarned);
  }, [sharedTasks, team.members]);

  // Derive Team Chat messages (for now, just filter existing by team id)
  const [chatMessages, setChatMessages] = useState<{
    id: string;
    sender: TeamMember;
    text: string;
    timestamp: string;
  }[]>(
    [
      { id: 'chat1', sender: { id: 'user1', name: 'Aryan', email: 'aryan@example.com' }, text: 'Hey team, great progress today!', timestamp: new Date().toISOString() },
      { id: 'chat2', sender: { id: 'user2', name: 'Rohan', email: 'rohan@example.com' }, text: 'Agreed! Let\'s keep it up.', timestamp: new Date().toISOString() },
    ].filter(msg => team.members.some(member => member.id === msg.sender.id))
  );

  // Filter activities and chat messages by team
  const teamChatMessages = useMemo(() => chatMessages.filter(message => message.sender.id === currentUser.id || team.members.some(member => member.id === message.sender.id)), [chatMessages, team.members, currentUser.id]);

  // Function to simulate updating team streak
  const updateTeamStreak = () => {
    // In a real implementation:
    // 1. Fetch all team members.
    // 2. For each team member, check if they completed at least one task today.
    // 3. If all members completed tasks, increment streak.
    // 4. If not all members completed tasks, and streak > 0, reset streak.
    // 5. Update `currentStreak` and `allMembersCompletedToday` states.
    console.log('Simulating team streak update...');
  };

  // Simulate daily check for team streak
  useEffect(() => {
    const dailyCheckInterval = setInterval(() => {
      updateTeamStreak();
    }, 24 * 60 * 60 * 1000); // Every 24 hours

    // Initial check
    updateTeamStreak();

    return () => clearInterval(dailyCheckInterval);
  }, []);

  // Function to update the leaderboard data
  const updateLeaderboard = () => {
    const userStats: { [key: string]: Omit<LeaderboardEntry, 'id'> & { id: string } } = {};

    tasks.filter(task => task.team && task.team.some(member => team.members.some(teamMember => teamMember.id === member.id))).forEach(task => {
      const ownerId = task.owner?.id || 'unassigned';
      const ownerName = task.owner?.name || 'Unassigned';

      if (!userStats[ownerId]) {
        userStats[ownerId] = {
          id: ownerId,
          name: ownerName,
          tasksCompleted: 0,
          taskQuality: 0, // Placeholder
          streakBehavior: 0, // Placeholder
          xpEarned: 0,
          speedOfCompletion: 0, // Placeholder
        };
      }

      if (task.status === 'Done') {
        userStats[ownerId].tasksCompleted += 1;
        userStats[ownerId].xpEarned += 10; // Example XP for completing a task
        // Further logic for taskQuality, streakBehavior, speedOfCompletion can be added here
      }
    });

    const newLeaderboardData = Object.values(userStats).sort((a, b) => b.xpEarned - a.xpEarned);
    setLeaderboardData(newLeaderboardData);
  };

  // Call updateLeaderboard initially and whenever tasks change
  useEffect(() => {
    updateLeaderboard();
  }, [tasks, team]); // Rerun when tasks or selected team change

  const handleAddComment = async (text: string) => {
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      author: currentUser,
      text,
      createdAt: new Date().toISOString(),
    };
    setComments((prevComments) => [...prevComments, newComment]);
    setActivities((prevActivities) => [
      ...prevActivities,
      {
        id: `activity_${Date.now()}`,
        text: `${currentUser.name} commented on a task in ${team.name}: "${newComment.text}"`, 
        timestamp: new Date().toISOString(),
      },
    ]);
    try {
      if (!selectedTask) {
        console.error('No task selected to add comment to.');
        return;
      }
      await addCommentToTask(selectedTask.id, newComment);
      console.log('Comment added to backend successfully');
    } catch (error) {
      console.error('Error adding comment to backend:', error);
      setComments((prevComments) => prevComments.filter(c => c.id !== newComment.id));
    }
  };

  const handleAddAttachment = async (attachment: Omit<Attachment, 'id' | 'uploadedAt'>) => {
    const newAttachment: Attachment = {
      ...attachment,
      id: `attach_${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setAttachments((prevAttachments) => [...prevAttachments, newAttachment]);
    setActivities((prevActivities) => [
      ...prevActivities,
      {
        id: `activity_${Date.now()}`,
        text: `${currentUser.name} attached a file: ${newAttachment.filename} to a task in ${team.name}`,
        timestamp: new Date().toISOString(),
      },
    ]);
    try {
      if (!selectedTask) {
        console.error('No task selected to add attachment to.');
        return;
      }
      await addAttachmentToTask(selectedTask.id, newAttachment);
      console.log('Attachment added to backend successfully');
    } catch (error) {
      console.error('Error adding attachment to backend:', error);
      setAttachments((prevAttachments) => prevAttachments.filter(a => a.id !== newAttachment.id));
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    const removedAttachment = attachments.find(a => a.id === attachmentId);
    setAttachments((prevAttachments) => prevAttachments.filter(a => a.id !== attachmentId));
    if (removedAttachment) {
      setActivities((prevActivities) => [
        ...prevActivities,
        {
          id: `activity_${Date.now()}`,
          text: `${currentUser.name} removed an attachment: ${removedAttachment.filename} from a task in ${team.name}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    try {
      if (!selectedTask) {
        console.error('No task selected to remove attachment from.');
        return;
      }
      await removeAttachmentFromTask(selectedTask.id, attachmentId);
      console.log('Attachment removed from backend successfully');
    } catch (error) {
      console.error('Error removing attachment from backend:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'To-do' | 'In Progress' | 'Done') => {
    try {
      await updateTask(taskId, { status: newStatus });
      console.log(`Task ${taskId} status updated to ${newStatus}`);
      const updatedTask = tasks.find(t => t.id === taskId);
      if (updatedTask) {
        setActivities((prevActivities) => [
          ...prevActivities,
          {
            id: `activity_${Date.now()}`,
            text: `${currentUser.name} updated task "${updatedTask.title}" status to ${newStatus} in ${team.name}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
      // Call updateTeamStreak when a task is completed
      if (newStatus === 'Done') {
        updateTeamStreak();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: `chat_${Date.now()}`,
      sender: currentUser,
      text,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);

    // Add to activity feed for the message itself
    setActivities((prevActivities) => [
      ...prevActivities,
      {
        id: `activity_${Date.now()}`,
        text: `${currentUser.name} sent a message in team chat in ${team.name}: "${text}"`, 
        timestamp: new Date().toISOString(),
      },
    ]);

    // Basic mention detection for activity feed
    const mentionedUsers = text.match(/@\w+/g);
    if (mentionedUsers && mentionedUsers.length > 0) {
      mentionedUsers.forEach((mention) => {
        const mentionedName = mention.substring(1); // Remove '@'
        setActivities((prevActivities) => [
          ...prevActivities,
          {
            id: `activity_mention_${Date.now()}`,
            text: `${currentUser.name} mentioned ${mentionedName} in chat in ${team.name}.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      });
    }
    
    // In a real application, send message to backend via a chat service
    console.log('Sending message:', newMessage);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{team.name} Shared Task Board</Text>
        
        <TeamStreakCard
          currentStreak={currentStreak}
          allMembersCompletedToday={allMembersCompletedToday}
        />

        <TeamLeaderboard leaderboardData={leaderboardData} />

        {sharedTasks.map(task => (
          <SharedTaskCard
            key={task.id}
            task={task}
            onUpdateStatus={handleUpdateTaskStatus}
            currentUserRole={currentUser.role}
            onSelectTask={setSelectedTask} // Pass setSelectedTask to enable selection
          />
        ))}

        <CommentSection
          comments={comments}
          onAddComment={handleAddComment}
          currentUser={currentUser}
        />

        <AttachmentSection
          attachments={attachments}
          onAddAttachment={handleAddAttachment}
          onRemoveAttachment={handleRemoveAttachment}
          currentUserRole={currentUser.role}
        />

        <TeamChat
          messages={teamChatMessages}
          onSendMessage={handleSendMessage}
          currentUser={currentUser}
        />

        <ActivityFeed activities={teamActivities} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default SharedTaskBoard;
