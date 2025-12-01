import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { AchievementStats, Badge } from '@/types/streak';
import {
  Award, // For trophies/achievements
  Flame, // Example badge icon
  Sun, // Example badge icon
  CalendarCheck, // Example badge icon
  HeartCrack, // For streak break (if used here)
} from 'lucide-react-native';

type AchievementsBadgesGridProps = {
  achievementStats: AchievementStats;
};

const IconMap = {
  'award': Award,
  'flame': Flame,
  'sun': Sun,
  'calendar-check': CalendarCheck,
  'heart-crack': HeartCrack,
  'trophy': Award, // Placeholder for trophies
}; 

const BadgeCard = ({ badge }: { badge: Badge }) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const IconComponent = IconMap[badge.iconUrl as keyof typeof IconMap] || Award; // Fallback

  return (
    <View style={[
      styles.badgeCard,
      { backgroundColor: badge.isUnlocked ? colors.surface : colors.card },
      !badge.isUnlocked && styles.lockedBadgeCard
    ]}>
      <View style={styles.badgeIconContainer}>
        <IconComponent size={32} color={badge.isUnlocked ? colors.accent : colors.textSecondary} />
      </View>
      <Text style={[typography.small, styles.badgeName, { color: badge.isUnlocked ? colors.textPrimary : colors.textSecondary }]} numberOfLines={1}>
        {badge.name}
      </Text>
      {badge.isUnlocked && badge.unlockedDate && (
        <Text style={[typography.tiny, { color: colors.textSecondary }]}>
          {new Date(badge.unlockedDate).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
};

const AchievementsBadgesGrid = ({ achievementStats }: AchievementsBadgesGridProps) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[typography.subheading, styles.sectionTitle, { color: colors.textPrimary }]}>
        Achievements & Badges
      </Text>

      <Text style={[typography.body, styles.subSectionTitle, { color: colors.textPrimary }]}>Unlocked Badges</Text>
      <View style={styles.badgeGrid}>
        {achievementStats.unlockedBadges.map(badge => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </View>

      <Text style={[typography.body, styles.subSectionTitle, { color: colors.textPrimary, marginTop: 24 }]}>Locked Badges</Text>
      <View style={styles.badgeGrid}>
        {achievementStats.lockedBadges.map(badge => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </View>

      <Text style={[typography.body, styles.subSectionTitle, { color: colors.textPrimary, marginTop: 24 }]}>Rank Milestones</Text>
      <View style={styles.badgeGrid}>
        {achievementStats.rankMilestoneTrophies.map(trophy => (
          <BadgeCard key={trophy.id} badge={{ ...trophy, isUnlocked: trophy.achieved, iconUrl: 'trophy', description: trophy.name }} />
        ))}
      </View>
    </View>
  );
};

export default AchievementsBadgesGrid;

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
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subSectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
  },
  badgeCard: {
    borderRadius: 12,
    padding: 10,
    width: 90,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  lockedBadgeCard: {
    opacity: 0.5,
  },
  badgeIconContainer: {
    marginBottom: 4,
  },
  badgeName: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
});

