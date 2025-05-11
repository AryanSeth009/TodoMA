import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useState } from 'react';

export default function SearchBar() {
  const { colors } = useTheme();
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.searchContainer, 
          { backgroundColor: colors.inputBackground }
        ]}
      >
        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder="Search"
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <TouchableOpacity 
        style={[styles.filterButton, { backgroundColor: colors.dark }]}
        activeOpacity={0.7}
      >
        <SlidersHorizontal size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});