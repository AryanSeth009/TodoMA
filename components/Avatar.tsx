import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet } from 'react-native';
import { generateAvatarUrl } from '@/utils/avatar';

interface AvatarProps {
  seed: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
  backgroundColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  seed,
  size = 40,
  style,
  backgroundColor,
}) => {
  const avatarUrl = generateAvatarUrl(seed, { size, backgroundColor });

  return (
    <Image
      source={require('@/assets/images/profile.jpg')}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#f0f0f0',
  },
});
