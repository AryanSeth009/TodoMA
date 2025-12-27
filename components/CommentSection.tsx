import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Comment, TeamMember } from '@/types/task';
import { Send } from 'lucide-react-native';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  currentUser: TeamMember; // Assuming we have a current user for adding comments
}

export default function CommentSection({ comments, onAddComment, currentUser }: CommentSectionProps) {
  const { colors } = useTheme();
  const [newCommentText, setNewCommentText] = useState('');

  const handleAddComment = () => {
    if (newCommentText.trim()) {
      onAddComment(newCommentText);
      setNewCommentText('');
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={[styles.commentContainer, { backgroundColor: colors.card }]}>
      <Text style={[styles.commentAuthor, { color: colors.textPrimary }]}>{item.author.name}</Text>
      <Text style={[styles.commentText, { color: colors.textSecondary }]}>{item.text}</Text>
      <Text style={[styles.commentDate, { color: colors.textSecondary }]}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Comments</Text>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary }}>No comments yet.</Text>
        }
      />
      {(currentUser.role === 'Admin' || currentUser.role === 'Member') && (
        <View style={styles.addCommentContainer}>
          <TextInput
            style={[
              styles.commentInput,
              { backgroundColor: colors.inputBackground, color: colors.textPrimary },
            ]}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textSecondary}
            value={newCommentText}
            onChangeText={setNewCommentText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
            <Send size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentText: {
    marginBottom: 5,
  },
  commentDate: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
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
