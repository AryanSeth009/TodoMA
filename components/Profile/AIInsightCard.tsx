import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { AIInsight } from '@/types/streak';
import {
  Lightbulb, // General insight
  Calendar, // Weekday/weekend insights
  Moon, // Night productivity
  BarChart, // Consistency increase
  AlertCircle, // Skipped tasks/reminders
  Snowflake, // From streak freeze
  HeartCrack, // From streak break
} from 'lucide-react-native';

type AIInsightCardProps = {
  insight: AIInsight;
};

const IconMap = {
  'general': Lightbulb,
  'calendar': Calendar,
  'moon': Moon,
  'bar-chart': BarChart,
  'alert-circle': AlertCircle,
  'snowflake': Snowflake, // From streak freeze
  'broken-heart': HeartCrack, // From streak break
};

const AIInsightCard = ({ insight }: AIInsightCardProps) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  const IconComponent = IconMap[insight.icon as keyof typeof IconMap] || Lightbulb; // Fallback to Lightbulb

  const handleAction = () => {
    if (insight.action) {
      console.log(`AI Insight Action: ${insight.action.type} - ${insight.action.payload}`);
      // Implement actual action logic here (e.g., navigate to settings, set reminder)
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.contentRow}>
        <IconComponent size={24} color={colors.textSecondary} />
        <Text style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: 12 }]}>
          {insight.message}
        </Text>
      </View>
      {insight.action && (
        <TouchableOpacity onPress={handleAction} style={[styles.actionButton, { backgroundColor: colors.accent }]}>
          <Text style={[typography.buttonText, { color: colors.white }]}>
            {insight.action.type === 'reminder' ? 'Set Reminder' : 'View Details'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AIInsightCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-end',
  },
});
