import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { useTaskStore } from '@/store/taskStore';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { TeamMember, Role } from '@/types/task';
import { Trash2, UserCog, Pencil } from 'lucide-react-native';

export default function TeamSettingsScreen() {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const { teamId: paramTeamId } = useLocalSearchParams();
  const router = useRouter();
  const { teams, user: loggedInUser, updateTeam, removeTeamMember, deleteTeam } = useTaskStore();

  const teamId = typeof paramTeamId === 'string' ? paramTeamId : undefined;
  const team = useMemo(() => teams.find(t => t.id === teamId), [teams, teamId]);

  const currentUser = useMemo(() => {
    if (loggedInUser && team) {
      const member = team.members.find(m => m.id === loggedInUser.email);
      return member ? { ...loggedInUser, role: member.role } : { ...loggedInUser, role: 'Guest' };
    }
    return { id: 'guest', name: 'Guest', email: 'guest@example.com', role: 'Guest' };
  }, [team, loggedInUser]);

  if (!team) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[typography.body, { color: colors.textPrimary, textAlign: 'center', marginTop: 50 }]}>
          Team not found or not selected.
        </Text>
      </View>
    );
  }

  const isAdmin = currentUser.role === 'Admin';

  const handleChangeRole = (memberId: string, newRole: Role) => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only team admins can change member roles.');
      return;
    }
    if (team.owner.id === memberId && newRole !== 'Admin') {
      Alert.alert('Cannot Change Role', 'The team owner\'s role cannot be changed from Admin.');
      return;
    }

    const updatedMembers = team.members.map(member =>
      member.id === memberId ? { ...member, role: newRole } : member
    );
    updateTeam({ ...team, members: updatedMembers });
    Alert.alert('Success', `Role for ${team.members.find(m => m.id === memberId)?.name} updated to ${newRole}`);
  };

  const handleRemoveMember = (memberId: string) => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only team admins can remove members.');
      return;
    }
    if (team.owner.id === memberId) {
      Alert.alert('Cannot Remove', 'The team owner cannot be removed from the team.');
      return;
    }

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${team.members.find(m => m.id === memberId)?.name} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            removeTeamMember(team.id, memberId);
            Alert.alert('Success', `Member removed from ${team.name}`);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDeleteTeam = () => {
    if (currentUser.id !== team.owner.id) {
      Alert.alert('Permission Denied', 'Only the team owner can delete the team.');
      return;
    }

    Alert.alert(
      'Delete Team',
      `Are you sure you want to delete the team '${team.name}'? This action cannot be undone.`, 
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            deleteTeam(team.id);
            Alert.alert('Success', `'${team.name}' has been deleted.`);
            router.back(); // Navigate back after deleting the team
          },
          style: 'destructive',
        },
      ]
    );
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
    },
    teamDetail: {
      fontSize: 16,
      marginBottom: 5,
    },
    memberCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
    },
    memberName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    memberRole: {
      fontSize: 14,
    },
    memberActions: {
      flexDirection: 'row',
      gap: 10,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
    },
    deleteButton: {
      marginTop: 30,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), [colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Team Settings', headerShown: true }} />
      <ScrollView>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{team.name} Settings</Text>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Team Details</Text>
        <Text style={[styles.teamDetail, { color: colors.textSecondary }]}>Owner: {team.owner.name}</Text>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Members</Text>
        {team.members.map(member => (
          <View key={member.id} style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.memberName, { color: colors.textPrimary }]}>{member.name}</Text>
              <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{member.role}</Text>
            </View>
            {isAdmin && member.id !== team.owner.id && ( // Only admins can manage others, not themselves or owner
              <View style={styles.memberActions}>
                <TouchableOpacity 
                  onPress={() => handleChangeRole(member.id, member.role === 'Member' ? 'Viewer' : 'Member')}
                  style={[styles.actionButton, { backgroundColor: colors.primary }]} // Example role toggle
                >
                  <UserCog size={20} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleRemoveMember(member.id)}
                  style={[styles.actionButton, { backgroundColor: colors.error }]}
                >
                  <Trash2 size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {isAdmin && (
          <TouchableOpacity 
            onPress={handleDeleteTeam}
            style={[styles.deleteButton, { backgroundColor: colors.error }]}
          >
            <Text style={[typography.buttonText, { color: colors.white }]}>Delete Team</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
