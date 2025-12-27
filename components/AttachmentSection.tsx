import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Attachment } from '@/types/task';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Paperclip, Image as ImageIcon, FileText, X } from 'lucide-react-native';

interface AttachmentSectionProps {
  attachments: Attachment[];
  onAddAttachment: (attachment: Omit<Attachment, 'id' | 'uploadedAt'>) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  currentUserRole?: 'Admin' | 'Member' | 'Viewer' | 'Guest'; // New prop for current user's role
}

export default function AttachmentSection({ attachments, onAddAttachment, onRemoveAttachment, currentUserRole }: AttachmentSectionProps) {
  const { colors } = useTheme();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newAttachment: Omit<Attachment, 'id' | 'uploadedAt'> = {
        filename: result.assets[0].uri.split('/').pop() || 'image.jpg',
        uri: result.assets[0].uri,
      };
      onAddAttachment(newAttachment);
    }
  };

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: false,
    });

    if (result.canceled === false) {
      const newAttachment: Omit<Attachment, 'id' | 'uploadedAt'> = {
        filename: result.assets[0].name,
        uri: result.assets[0].uri,
      };
      onAddAttachment(newAttachment);
    }
  };

  const renderAttachment = ({ item }: { item: Attachment }) => (
    <View style={[styles.attachmentItem, { backgroundColor: colors.card }]}>
      {item.uri.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
        <Image source={{ uri: item.uri }} style={styles.attachmentImage} />
      ) : (
        <FileText size={24} color={colors.textPrimary} style={styles.attachmentIcon} />
      )}
      <Text style={[styles.attachmentFilename, { color: colors.textPrimary }]} numberOfLines={1}>
        {item.filename}
      </Text>
      {currentUserRole === 'Admin' || currentUserRole === 'Member' ? (
        <TouchableOpacity onPress={() => onRemoveAttachment(item.id)} style={styles.removeButton}>
          <X size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Attachments</Text>
      {(currentUserRole === 'Admin' || currentUserRole === 'Member') && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.attachmentButton, { backgroundColor: colors.card }]} onPress={pickImage}>
            <ImageIcon size={20} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary, marginLeft: 5 }}>Add Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.attachmentButton, { backgroundColor: colors.card }]} onPress={pickDocument}>
            <Paperclip size={20} color={colors.textPrimary} />
            <Text style={{ color: colors.textPrimary, marginLeft: 5 }}>Add Document</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={attachments}
        renderItem={renderAttachment}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary }}>No attachments yet.</Text>
        }
      />
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  attachmentImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  attachmentIcon: {
    marginRight: 10,
  },
  attachmentFilename: {
    flex: 1,
    fontSize: 14,
  },
  removeButton: {
    marginLeft: 10,
    padding: 5,
  },
});
