import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { X } from 'lucide-react-native';
import { createTypography } from '../styles/typography';

interface CreateTeamModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreateTeam: (teamName: string) => void;
}

export default function CreateTeamModal({ isVisible, onClose, onCreateTeam }: CreateTeamModalProps) {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const [teamName, setTeamName] = useState('');

  const handleSubmit = () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }
    onCreateTeam(teamName);
    setTeamName('');
    onClose();
  };

  const styles = useMemo(() => StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      borderRadius: 24,
      padding: 24,
      width: '80%',
      maxHeight: '70%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    input: {
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    submitButton: {
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
  }), [colors]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[typography.heading, { color: colors.textPrimary }]}>
              Create New Team
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={[typography.label, { color: colors.textPrimary }]}>
            Team Name
          </Text>
          <TextInput
            style={[
              typography.body,
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                color: colors.textPrimary,
              },
            ]}
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name"
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={[typography.buttonText, { color: colors.white }]}>
              Create Team
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
