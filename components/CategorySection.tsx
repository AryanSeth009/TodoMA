import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import CategoryCard from './CategoryCard';
import { Plus } from 'lucide-react-native';
import { categories } from '@/data/categoryData';

export default function CategorySection() {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
        Categories
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
        <TouchableOpacity 
          style={[styles.addCard, { backgroundColor: colors.inputBackground }]}
          activeOpacity={0.7}
        >
          <Plus size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  addCard: {
    width: 120,
    height: 150,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});