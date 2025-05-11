import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategorySection from '@/components/CategorySection';
import TaskSection from '@/components/TaskSection';
import CompletedTasks from '@/components/CompletedTasks';
import QuickTaskInput from '@/components/QuickTaskInput';
import AddTaskButton from '@/components/AddTaskButton';
import { StatusBar } from 'expo-status-bar';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.background,
          paddingTop: insets.top 
        }
      ]}
    >
      <StatusBar style="auto" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header />
        <SearchBar />
        <QuickTaskInput />
        {/* <CategorySection /> */}
        <TaskSection />
        <CompletedTasks />
      </ScrollView>
      <AddTaskButton />
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});