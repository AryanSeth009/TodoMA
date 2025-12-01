import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView, Platform, Alert } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '@/hooks/useTheme';
import { useTaskStore, TASK_COLORS } from '@/store/taskStore'; // Import TASK_COLORS
import { X, Clock } from 'lucide-react-native';
import { createTypography } from '../styles/typography';

type AddTaskModalProps = {
  isVisible: boolean;
  onClose: () => void;
  isScheduled?: boolean;
};

export default function AddTaskModal({ isVisible, onClose, isScheduled = false }: AddTaskModalProps) {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const addTask = useTaskStore((state) => state.addTask);
  const addScheduledTask = useTaskStore((state) => state.addScheduledTask);
  
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTimeText, setStartTimeText] = useState('');
  const [endTimeText, setEndTimeText] = useState('');
  const [startAmPm, setStartAmPm] = useState('AM');
  const [endAmPm, setEndAmPm] = useState('AM');
  const [selectedColor, setSelectedColor] = useState(colors.primary);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [manualTimeInput, setManualTimeInput] = useState(false);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  
  // Parse time string in format "1:30 PM" or "13:30"
  const parseTimeString = (timeStr: string): Date | null => {
    try {
      const now = new Date();
      let hours = 0;
      let minutes = 0;
      let isPM = false;
      
      // Check if time is in 12-hour format with AM/PM
      if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
        isPM = timeStr.toLowerCase().includes('pm');
        const timeParts = timeStr.replace(/[^0-9:]/g, '').split(':');
        hours = parseInt(timeParts[0], 10);
        minutes = timeParts.length > 1 ? parseInt(timeParts[1], 10) : 0;
        
        // Convert 12-hour to 24-hour format
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
      } else {
        // Assume 24-hour format
        const timeParts = timeStr.split(':');
        hours = parseInt(timeParts[0], 10);
        minutes = timeParts.length > 1 ? parseInt(timeParts[1], 10) : 0;
      }
      
      // Validate hours and minutes
      if (isNaN(hours) || hours < 0 || hours > 23 || isNaN(minutes) || minutes < 0 || minutes > 59) {
        return null;
      }
      
      const result = new Date(now);
      result.setHours(hours, minutes, 0, 0);
      return result;
    } catch (e) {
      return null;
    }
  };
  
  const colorOptions = TASK_COLORS; // Use TASK_COLORS for color options

  const validateTimes = () => {
    let start = startDate;
    let end = endDate;
    
    // If using manual input, parse the time strings
    if (manualTimeInput) {
      const parsedStart = parseTimeString(`${startTimeText} ${startAmPm}`);
      const parsedEnd = parseTimeString(`${endTimeText} ${endAmPm}`);
      
      if (!parsedStart || !parsedEnd) {
        Alert.alert('Invalid Time Format', 'Please enter time in format "1:30 PM" or "13:30"');
        return false;
      }
      
      start = parsedStart;
      end = parsedEnd;
      
      // Update the date objects
      setStartDate(start);
      setEndDate(end);
    }
    
    if (end < start) {
      Alert.alert('Invalid Time', 'End time must be after start time');
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!validateTimes()) return;

    // Create task without an ID - the API will assign one
    const newTask = {
      title,
      description: '',
      startTime: manualTimeInput ? `${startTimeText} ${startAmPm}` : formatTime(startDate),
      endTime: manualTimeInput ? `${endTimeText} ${endAmPm}` : formatTime(endDate),
      team: [],
      color: selectedColor === colors.primary ? getNextTaskColor(TASK_COLORS) : selectedColor, // Use selectedColor or get next color
      progress: 0,
      daysRemaining: 7,
      categoryId: 'default'
    };

    if (isScheduled) {
      addScheduledTask({
        ...newTask,
        time: manualTimeInput ? `${startTimeText} ${startAmPm}` : formatTime(startDate),
        hasCall: false,
      }, TASK_COLORS); // Pass TASK_COLORS
    } else {
      addTask(newTask, TASK_COLORS); // Pass TASK_COLORS
    }

    const handleClose = () => {
      setTitle('');
      // Set initial times: start time to next hour, end time to hour after that
      const now = new Date();
      const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0));
      const hourAfter = new Date(now.setHours(now.getHours() + 2, 0, 0));
      setStartDate(nextHour);
      setEndDate(hourAfter);
      // Set default time text and AM/PM values
      const nextHourTime = formatTime(nextHour);
      const hourAfterTime = formatTime(hourAfter);
      
      setStartTimeText(nextHourTime.split(' ')[0]); // Just the time part
      setEndTimeText(hourAfterTime.split(' ')[0]); // Just the time part
      setStartAmPm(nextHourTime.includes('PM') ? 'PM' : 'AM');
      setEndAmPm(hourAfterTime.includes('PM') ? 'PM' : 'AM');
      setSelectedColor(colors.primary); // Use primary color as initial selected color
      setShowStartPicker(false);
      setShowEndPicker(false);
      setManualTimeInput(false);
      onClose();
    };
    handleClose();
  };

  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    timeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    timeToggle: {
      padding: 4,
    },
    timeInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      position: 'relative',
    },
    timeInput: {
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 16,
      flex: 1,
    },
    amPmContainer: {
      flexDirection: 'row',
      marginLeft: 8,
      borderRadius: 8,
      overflow: 'hidden',
    },
    amPmButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
    },
    amPmText: {

    },
    timeIcon: {
      position: 'absolute',
      right: 16,
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      minHeight: '70%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    form: {
      flex: 1,
    },
    input: {
      height: 48,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    colorOptions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
      marginBottom: 24,
    },
    colorOption: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    selectedColor: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    submitButton: {
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
  }), [colors]); // Recreate styles if colors change

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[typography.heading, { color: colors.textPrimary }]}>
              Add New Task
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={[typography.label, { color: colors.textPrimary }]}>
              Task Title
            </Text>
            <TextInput
              style={[
                typography.body, // Apply typography.body
                styles.input,
                { 
                  backgroundColor: colors.inputBackground,
                  color: colors.textPrimary 
                }
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.timeHeader}>
              <Text style={[typography.label, { color: colors.textPrimary }]}>
                Start Time
              </Text>
              <TouchableOpacity 
                onPress={() => setManualTimeInput(!manualTimeInput)}
                style={styles.timeToggle}
              >
                <Text style={[typography.small, { color: colors.textSecondary }]}>
                  {manualTimeInput ? 'Use picker' : 'Type manually'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {manualTimeInput ? (
              <View style={styles.timeInputContainer}>
                <TextInput
                  style={[
                    typography.body, // Apply typography.body
                    styles.timeInput,
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.textPrimary,
                    }
                  ]}
                  value={startTimeText}
                  onChangeText={setStartTimeText}
                  placeholder="e.g. 1:30"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numbers-and-punctuation"
                />
                <View style={styles.amPmContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.amPmButton, 
                      startAmPm === 'AM' && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setStartAmPm('AM')}
                  >
                    <Text style={[
                      typography.small, // Apply typography.small
                      styles.amPmText, 
                      startAmPm === 'AM' && { color: colors.onPrimary }
                    ]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.amPmButton, 
                      startAmPm === 'PM' && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setStartAmPm('PM')}
                  >
                    <Text style={[
                      typography.small, // Apply typography.small
                      styles.amPmText, 
                      startAmPm === 'PM' && { color: colors.onPrimary }
                    ]}>PM</Text>
                  </TouchableOpacity>
                </View>
                <Clock size={16} color={colors.textSecondary} style={styles.timeIcon} />
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.inputBackground,
                    justifyContent: 'center'
                  }
                ]}
              >
                <Text style={[typography.body, { color: colors.textPrimary }]}> 
                  {formatTime(startDate)}
                </Text>
              </TouchableOpacity>
            )}

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onStartDateChange}
              />
            )}

            {!isScheduled && (
              <>
                <Text style={[typography.label, { color: colors.textPrimary, marginTop: 16 }]}>
                  End Time
                </Text>
                {manualTimeInput ? (
                  <View style={styles.timeInputContainer}>
                    <TextInput
                      style={[
                        typography.body, // Apply typography.body
                        styles.timeInput,
                        { 
                          backgroundColor: colors.inputBackground,
                          color: colors.textPrimary,
                        }
                      ]}
                      value={endTimeText}
                      onChangeText={setEndTimeText}
                      placeholder="e.g. 2:30"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numbers-and-punctuation"
                    />
                    <View style={styles.amPmContainer}>
                      <TouchableOpacity 
                        style={[
                          styles.amPmButton, 
                          endAmPm === 'AM' && { backgroundColor: colors.primary }
                        ]}
                        onPress={() => setEndAmPm('AM')}
                      >
                        <Text style={[
                          typography.small, 
                          styles.amPmText, 
                          endAmPm === 'AM' && { color: colors.onPrimary }
                        ]}>AM</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.amPmButton, 
                          endAmPm === 'PM' && { backgroundColor: colors.primary }
                        ]}
                        onPress={() => setEndAmPm('PM')}
                      >
                        <Text style={[
                          typography.small, // Apply typography.small
                          styles.amPmText, 
                          endAmPm === 'PM' && { color: colors.onPrimary }
                        ]}>PM</Text>
                      </TouchableOpacity>
                    </View>
                    <Clock size={16} color={colors.textSecondary} style={styles.timeIcon} />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    style={[
                      styles.input,
                      { 
                        backgroundColor: colors.inputBackground,
                        justifyContent: 'center'
                      }
                    ]}
                  >
                    <Text style={[typography.body, { color: colors.textPrimary }]}>
                      {formatTime(endDate)}
                    </Text>
                  </TouchableOpacity>
                )}

                {showEndPicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onEndDateChange}
                  />
                )}
              </>
            )}

            <Text style={[typography.label, { color: colors.textPrimary }]}>
              Color
            </Text>
            <View style={styles.colorOptions}>
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
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={[typography.buttonText, { color: colors.white }]}> 
                Add Task
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}