import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import ScheduleHeader from '@/components/ScheduleHeader';
import DateSelector from '@/components/DateSelector';
import TimelineTasks from '@/components/TimelineTasks';
import AddTaskButton from '@/components/AddTaskButton';
import { StatusBar } from 'expo-status-bar';

const ScheduleScreen = () => {
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
      <ScheduleHeader />
      <DateSelector />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TimelineTasks />
      </ScrollView>
      <AddTaskButton />
    </View>
  );
}

export default ScheduleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});