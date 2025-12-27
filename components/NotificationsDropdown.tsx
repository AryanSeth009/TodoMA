import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { X } from 'lucide-react-native';
import { createTypography } from '../styles/typography';
import { TeamInvitation } from '@/types/task'; // Import TeamInvitation type
import { useTaskStore } from '@/store/taskStore'; // Import useTaskStore

interface NotificationsDropdownProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function NotificationsDropdown({
  isVisible,
  onClose,
}: NotificationsDropdownProps) {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const { pendingInvitations, acceptTeamInvitation, rejectTeamInvitation, user } = useTaskStore();

  // Filter invitations to only show those for the current logged-in user
  const userInvitations = useMemo(() => {
    if (!user) return [];
    return pendingInvitations.filter(inv => inv.recipientEmail === user.email);
  }, [pendingInvitations, user]);

  const handleAcceptInvitation = async (invitationId: string, teamId: string) => {
    await acceptTeamInvitation(invitationId, teamId);
    onClose(); // Close dropdown after action
  };

  const handleRejectInvitation = async (invitationId: string, teamId: string) => {
    await rejectTeamInvitation(invitationId, teamId);
    onClose(); // Close dropdown after action
  };

  const renderInvitationItem = ({ item }: { item: TeamInvitation }) => (
    <View style={[styles.invitationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[typography.body, { color: colors.textPrimary, marginBottom: 5 }]}>
        <Text style={{ fontWeight: 'bold' }}>{item.inviterName}</Text> invited you to join{' '}
        <Text style={{ fontWeight: 'bold' }}>{item.teamName}</Text>.
      </Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success }]} // Green for accept
          onPress={() => handleAcceptInvitation(item.id, item.teamId)}
        >
          <Text style={[typography.buttonText, { color: colors.white }]}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error, marginLeft: 10 }]} // Red for reject
          onPress={() => handleRejectInvitation(item.id, item.teamId)}
        >
          <Text style={[typography.buttonText, { color: colors.white }]}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const styles = useMemo(() => StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start', // Align to top
      alignItems: 'flex-end', // Align to right
    },
    modalContent: {
      borderRadius: 12,
      padding: 15,
      width: 300, // Fixed width for dropdown
      marginRight: 10, // Adjust position from right edge
      marginTop: 60, // Adjust position from top edge (below header)
      maxHeight: '70%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    invitationCard: {
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      marginBottom: 10,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 10,
    },
    actionButton: {
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyMessage: {
      textAlign: 'center',
      marginTop: 20,
    }
  }), [colors]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[typography.heading, { color: colors.textPrimary }]}>
              Notifications
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          {userInvitations.length === 0 ? (
            <Text style={[typography.body, styles.emptyMessage, { color: colors.textSecondary }]}>
              No new invitations.
            </Text>
          ) : (
            <FlatList
              data={userInvitations}
              renderItem={renderInvitationItem}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
