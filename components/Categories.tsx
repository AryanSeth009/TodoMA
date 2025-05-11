import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTaskStore } from '@/store/taskStore';
import { Feather } from '@expo/vector-icons';

export const Categories = () => {
  const { colors } = useTheme();
  const [newCategory, setNewCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4A90E2');
  const categories = useTaskStore((state) => state.categories);
  const addCategory = useTaskStore((state) => state.addCategory);

  const colorOptions = [
    '#4A90E2', // Blue
    '#50E3C2', // Turquoise
    '#F5A623', // Orange
    '#D0021B', // Red
    '#7ED321', // Green
    '#9013FE', // Purple
  ];

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      await addCategory({
        name: newCategory.trim(),
        color: selectedColor,
      });
      setNewCategory('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={newCategory}
          onChangeText={setNewCategory}
          placeholder="Add new category"
          placeholderTextColor={colors.textSecondary}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </ScrollView>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddCategory}
        >
          <Feather name="plus" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.categoriesList}>
        {categories.map((category) => (
          <View
            key={category.id}
            style={[
              styles.categoryItem,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
            <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
  addButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 