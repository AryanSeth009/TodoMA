import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'; // Import FlatList
import { useTheme } from '@/hooks/useTheme';
import SharedTaskBoard from '@/components/SharedTaskBoard';
import CreateTeamModal from '@/components/CreateTeamModal';
import InviteMembersModal from '@/components/InviteMembersModal';
import { Plus, UserPlus, Settings2 } from 'lucide-react-native'; // Import Settings2 icon
import { useTaskStore } from '@/store/taskStore'; // Import useTaskStore
import { Team } from '@/types/task'; // Import Team type
import { useRouter } from 'expo-router'; // Import useRouter

export default function SocialScreen() {
  const { colors } = useTheme();
  const { teams, createTeam, inviteTeamMember } = useTaskStore(); // Get inviteTeamMember from store
  const [isCreateTeamModalVisible, setCreateTeamModalVisible] = useState(false);
  const [isInviteMembersModalVisible, setInviteMembersModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null); // State for selected team
  const router = useRouter(); // Initialize router

  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0]); // Select the first team by default
    }
  }, [teams, selectedTeam]);

  const handleCreateTeam = async (teamName: string) => {
    await createTeam(teamName);
    setCreateTeamModalVisible(false);
  };

  const handleSendInvitations = async (emails: string[]) => {
    if (!selectedTeam) {
      console.error('No team selected to send invitations to.');
      return;
    }
    for (const email of emails) {
      await inviteTeamMember(selectedTeam.id, email);
    }
    setInviteMembersModalVisible(false);
  };

  const handleGoToTeamSettings = () => {
    if (selectedTeam) {
      router.push({ pathname: '/team-settings', params: { teamId: selectedTeam.id } });
    }
  };

  const renderTeamItem = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={[
        styles.teamItem,
        { backgroundColor: item.id === selectedTeam?.id ? colors.primary : colors.card },
      ]}
      onPress={() => setSelectedTeam(item)}
    >
      <Text style={[
        styles.teamName,
        { color: item.id === selectedTeam?.id ? colors.white : colors.textPrimary },
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.teamSelectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Teams</Text>
          {selectedTeam && (
            <TouchableOpacity onPress={handleGoToTeamSettings}>
              <Settings2 size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        {teams.length === 0 ? (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 10 }}>
            No teams yet. Create one to get started!
          </Text>
        ) : (
          <FlatList
            data={teams}
            renderItem={renderTeamItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.teamListContent}
          />
        )}
      </View>

      {selectedTeam && <SharedTaskBoard team={selectedTeam} />} // Pass selectedTeam to SharedTaskBoard

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: colors.primary }]} // Apply theme color
          onPress={() => setInviteMembersModalVisible(true)}
        >
          <UserPlus size={24} color={colors.white} />
          <Text style={[styles.fabButtonText, { color: colors.white }]}>Invite</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: colors.primary, marginTop: 10 }]} // Apply theme color
          onPress={() => setCreateTeamModalVisible(true)}
        >
          <Plus size={24} color={colors.white} />
          <Text style={[styles.fabButtonText, { color: colors.white }]}>Create Team</Text>
        </TouchableOpacity>
      </View>

      <CreateTeamModal
        isVisible={isCreateTeamModalVisible}
        onClose={() => setCreateTeamModalVisible(false)}
        onCreateTeam={handleCreateTeam}
        selectedTeamId={selectedTeam?.id} // Pass selectedTeamId to CreateTeamModal
      />

      <InviteMembersModal
        isVisible={isInviteMembersModalVisible}
        onClose={() => setInviteMembersModalVisible(false)}
        onSendInvitations={handleSendInvitations}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  teamSelectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamListContent: {
    paddingVertical: 5,
  },
  teamItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  fabButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
