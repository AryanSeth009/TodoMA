import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft, Calendar, ChevronRight } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { useTaskStore } from '@/store/taskStore';
import { useState, useMemo } from 'react';
import { goBack } from 'expo-router/build/global-state/routing';
import { createTypography } from '../styles/typography';

export default function ScheduleHeader() {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const user = useTaskStore((state) => state.user);
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const setSelectedDate = useTaskStore((state) => state.setSelectedDate);
  
  // State for calendar modal
  const [calendarVisible, setCalendarVisible] = useState(false);
  
  // Get the selected date object
  const selectedDateObj = useMemo(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  }, [selectedDate]);
  
  // Format the selected date
  const formattedDate = useMemo(() => {
    return selectedDateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
    });
  }, [selectedDateObj]);
  
  // Check if selected date is today
  const isToday = useMemo(() => {
    const today = new Date();
    return (
      selectedDateObj.getDate() === today.getDate() &&
      selectedDateObj.getMonth() === today.getMonth() &&
      selectedDateObj.getFullYear() === today.getFullYear()
    );
  }, [selectedDateObj]);
  
  // Generate dates for the week view
  const weekDates = useMemo(() => {
    const dates = [];
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Start from 3 days ago
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 3);
    
    // Generate 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }, []);
  
  // Navigate to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDateObj);
    newDate.setDate(selectedDateObj.getDate() - 1);
    setSelectedDate(newDate.getTime());
  };
  
  // Navigate to next day
  const goToNextDay = () => {
    const newDate = new Date(selectedDateObj);
    newDate.setDate(selectedDateObj.getDate() + 1);
    setSelectedDate(newDate.getTime());
  };
  
  // Go to today
  const goToToday = () => {
    setSelectedDate(new Date().getTime());
  };
  
  // Toggle calendar modal
  const toggleCalendar = () => {
    setCalendarVisible(!calendarVisible);
  };
  
  // Select a date from the calendar
  const selectDate = (date: Date) => {
    setSelectedDate(date.getTime());
    setCalendarVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={goBack}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <View>
          <Text style={[typography.heading, { color: colors.textPrimary }]}>
            {isToday ? "Today's tasks" : "Schedule"}
          </Text>
          <TouchableOpacity onPress={toggleCalendar}>
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary }
              ]}
            >
              {formattedDate}
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={goToNextDay}
        >
          <ChevronRight size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={[
            styles.calendarButton,
            { backgroundColor: colors.onPrimary }
          ]}
          onPress={toggleCalendar}
        >
          <Calendar size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Avatar
          seed={user?.email || 'guest'}
          size={40}
          style={styles.avatar}
        />
      </View>
      
      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCalendarVisible(false)}
        >
          <View 
            style={[styles.calendarContainer, { backgroundColor: colors.background }]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <Text style={[typography.heading, { color: colors.textPrimary, marginBottom: 16 }]}>
              Select Date
            </Text>
            
            {/* Week view */}
            <FlatList
              data={weekDates}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.weekContainer}
              renderItem={({ item }) => {
                const isSelected = 
                  item.getDate() === selectedDateObj.getDate() &&
                  item.getMonth() === selectedDateObj.getMonth() &&
                  item.getFullYear() === selectedDateObj.getFullYear();
                  
                const isCurrentDay = 
                  item.getDate() === new Date().getDate() &&
                  item.getMonth() === new Date().getMonth() &&
                  item.getFullYear() === new Date().getFullYear();
                  
                return (
                  <TouchableOpacity
                    style={[
                      styles.dayButton,
                      isSelected && [styles.selectedDay, { backgroundColor: colors.primary }]
                    ]}
                    onPress={() => selectDate(item)}
                  >
                    <Text style={[
                      styles.dayName,
                      { color: isSelected ? '#fff' : colors.textPrimary }
                    ]}>
                      {item.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)}
                    </Text>
                    <Text style={[
                      styles.dayNumber,
                      { 
                        color: isSelected ? '#fff' : colors.textPrimary,
                        fontFamily: isCurrentDay ? colors.fontFamily.bold : colors.fontFamily.regular,
                      }
                    ]}>
                      {item.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.toISOString()}
            />
            
            {/* Today button */}
            <TouchableOpacity 
              style={[styles.todayButton, { backgroundColor: colors.secondary }]}
              onPress={() => {
                goToToday();
                setCalendarVisible(false);
              }}
            >
              <Text style={[typography.buttonText, { color: colors.onPrimary }]}>
                Go to Today
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  nextButton: {
    marginLeft: 12,
    padding: 4,
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  weekContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dayButton: {
    width: 50,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: '#007AFF',
  },
  dayName: {
    fontSize: 12,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
  },
  todayButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
});