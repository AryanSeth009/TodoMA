import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Category } from '@/types/category';
import { useMemo } from 'react';
import { createTypography } from '../styles/typography';

type CategoryCardProps = {
  category: Category;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const { name, ount, color, image } = category;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: color }]}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={[typography.cardTitle, styles.title]}>
          {name}
        </Text>
        <Text style={[typography.cardSubtitle, styles.subtitle]}>
          {ount.toString().padStart(2, '0')} Tasks
        </Text>
      </View>
      <Image 
        source={{ uri: image }}
        style={styles.image}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 150,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    color: colors.textPrimary, // Use theme color
    opacity: 0.8,
  },
  subtitle: {
    color: colors.textSecondary, // Use theme color
    opacity: 0.7,
    marginTop: 4,
  },
  image: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 80,
    height: 80,
  },
});