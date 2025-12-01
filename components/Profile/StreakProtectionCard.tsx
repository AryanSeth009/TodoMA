import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { Streak } from '@/types/streak';
import { useStreakStore } from '@/store/streakStore';
import { Snowflake } from 'lucide-react-native';

type StreakProtectionCardProps = {
  streak: Streak;
};

const StreakProtectionCard = ({ streak }: StreakProtectionCardProps) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const useFreezeToken = useStreakStore((state) => state.useFreezeToken);

  const handleFreeze = () => {
    // Implement actual streak freeze logic (e.g., show a confirmation modal)
    useFreezeToken();
    console.log("Streak freeze activated!");
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[typography.subheading, styles.sectionTitle, { color: colors.textPrimary }]}>
        Streak Protection
      </Text>
      <View style={styles.contentRow}>
        <View style={styles.tokenDisplay}>
          <Snowflake size={24} color={colors.accent} />
          <Text style={[typography.heading, { color: colors.textPrimary, marginLeft: 8 }]}>
            {streak.freezeTokens}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 4 }]}>Freeze Tokens</Text>
        </View>
        
        {streak.freezeTokens > 0 ? (
          <TouchableOpacity onPress={handleFreeze} style={[styles.button, { backgroundColor: colors.highlight }]}>
            <Text style={[typography.buttonText, { color: colors.white }]}>Activate Freeze</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.messageContainer}>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
              Out of freeze tokens. Get streak insurance to protect your progress!
            </Text>
            {/* CTA for streak insurance (Premium feature) */}
            <TouchableOpacity style={[styles.ctaButton, { backgroundColor: colors.accent }]}>
              <Text style={[typography.buttonText, { color: colors.white }]}>Get Streak Insurance</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* Future: "Restore streak using 1 token?" popup logic here */}
    </View>
  );
};

export default StreakProtectionCard;

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
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contentRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  tokenDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  messageContainer: {
    alignItems: 'center',
    gap: 8,
  },
  ctaButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
});
