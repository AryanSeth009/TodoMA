import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Category } from '@/types/category';

type CategoryCardProps = {
  category: Category;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  const { colors, typography } = useTheme();
  const { name, taskCount, color, image } = category;

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
          {taskCount.toString().padStart(2, '0')} Tasks
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
    color: '#000',
    opacity: 0.8,
  },
  subtitle: {
    color: '#000',
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