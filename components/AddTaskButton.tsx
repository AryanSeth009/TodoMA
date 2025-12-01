import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useState } from 'react';
import AddTaskModal from './AddTaskModal';

type AddTaskButtonProps = {
  isScheduled?: boolean;
};

export default function AddTaskButton({ isScheduled = false }: AddTaskButtonProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(1) },
      ],
    };
  });

  return (
    <>
      <Animated.View 
        style={[
          styles.container, 
          buttonStyle,
          { bottom: Math.max(24, insets.bottom + 8) }
        ]}
      >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => setIsModalVisible(true)}
        >
          <Plus size={24} color={colors.onPrimary} />
        </TouchableOpacity>
      </Animated.View>

      <AddTaskModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        isScheduled={isScheduled}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderRadius: 28,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});