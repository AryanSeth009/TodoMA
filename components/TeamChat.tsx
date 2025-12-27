import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Send } from 'lucide-react-native';
import { TeamMember } from '@/types/task';

interface ChatMessage {
  id: string;
  sender: TeamMember;
  text: string;
  timestamp: string;
}

interface TeamChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: TeamMember;
}

const TeamChat = ({ messages, onSendMessage, currentUser }: TeamChatProps) => {
  const { colors } = useTheme();
  const [newMessageText, setNewMessageText] = useState('');

  const handleSendMessage = () => {
    if (newMessageText.trim()) {
      onSendMessage(newMessageText);
      setNewMessageText('');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageContainer, item.sender.id === currentUser.id ? styles.myMessage : styles.otherMessage]}>
      <Text style={[styles.senderName, { color: colors.textPrimary }]}>{item.sender.name}</Text>
      <Text style={[styles.messageText, { color: colors.textPrimary }]}>{item.text}</Text>
      <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Team Chat</Text>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted // To show most recent messages at the bottom
        contentContainerStyle={styles.messageListContent}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No messages yet.</Text>
        }
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.messageInput,
            { backgroundColor: colors.inputBackground, color: colors.textPrimary },
          ]}
          placeholder="Type your message..."
          placeholderTextColor={colors.textSecondary}
          value={newMessageText}
          onChangeText={setNewMessageText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Send size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageListContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6', // Light green for my messages (will be themed later)
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0', // Light gray for other messages (will be themed later)
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  messageInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    padding: 5,
  },
});

export default TeamChat;
