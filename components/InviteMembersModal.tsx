import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { X, Mail } from 'lucide-react-native';
import { createTypography } from '../styles/typography';

interface InviteMembersModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSendInvitations: (emails: string[]) => void;
}

export default function InviteMembersModal({ isVisible, onClose, onSendInvitations }: InviteMembersModalProps) {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const [emailInput, setEmailInput] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleAddEmail = () => {
    if (validateEmail(emailInput) && !invitedEmails.includes(emailInput)) {
      setInvitedEmails((prev) => [...prev, emailInput]);
      setEmailInput('');
    } else if (invitedEmails.includes(emailInput)) {
      Alert.alert('Duplicate Email', 'This email has already been added.');
    } else {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setInvitedEmails((prev) => prev.filter(email => email !== emailToRemove));
  };

  const handleSend = () => {
    if (invitedEmails.length === 0) {
      Alert.alert('No Emails', 'Please add at least one email address to invite.');
      return;
    }
    onSendInvitations(invitedEmails);
    setInvitedEmails([]);
    onClose();
  };

  const renderInvitedEmail = ({ item }: { item: string }) => (
    <View style={[styles.invitedEmailContainer, { backgroundColor: colors.inputBackground }]}>
      <Text style={[typography.body, { color: colors.textPrimary }]}>{item}</Text>
      <TouchableOpacity onPress={() => handleRemoveEmail(item)} style={styles.removeEmailButton}>
        <X size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

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
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    emailInput: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginRight: 10,
    },
    addButton: {
      height: 48,
      width: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    invitedEmailsList: {
      maxHeight: 150,
      marginBottom: 20,
    },
    invitedEmailContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      borderRadius: 8,
      marginBottom: 8,
    },
    removeEmailButton: {
      padding: 5,
    },
    sendButton: {
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
              Invite Team Members
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={[typography.label, { color: colors.textPrimary }]}>
            Email Address
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                typography.body,
                styles.emailInput,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.textPrimary,
                },
              ]}
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="Enter email to invite"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]} // Apply theme color
              onPress={handleAddEmail}
            >
              <Mail size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={invitedEmails}
            renderItem={renderInvitedEmail}
            keyExtractor={(item) => item}
            style={styles.invitedEmailsList}
          />

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={handleSend}
          >
            <Text style={[typography.buttonText, { color: colors.white }]}>
              Send Invitations
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
