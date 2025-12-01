import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { AppSettings } from '@/types/streak';
import { useStreakStore } from '@/store/streakStore';

type PersonalizationSettingsProps = {
  appSettings: AppSettings;
};

const PersonalizationSettings = ({ appSettings }: PersonalizationSettingsProps) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);
  const updateAppSettings = useStreakStore((state) => state.updateAppSettings);

  const handleToggle = (key: keyof AppSettings['privacySettings'] | 'soundEnabled' | 'smartRemindersOn') => {
    updateAppSettings({ [key]: !appSettings[key] });
  };

  const handlePrivacyToggle = (key: keyof AppSettings['privacySettings']) => {
    updateAppSettings({
      privacySettings: { ...appSettings.privacySettings, [key]: !appSettings.privacySettings[key] },
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[typography.subheading, styles.sectionTitle, { color: colors.textPrimary }]}>
        Personalization & Settings
      </Text>

      <View style={styles.settingItem}>
        <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>Sound & Reminder Type</Text>
        <Switch
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={appSettings.soundEnabled ? colors.highlight : colors.textSecondary}
          ios_backgroundColor={colors.border}
          onValueChange={() => handleToggle('soundEnabled')}
          value={appSettings.soundEnabled}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>Smart Reminders</Text>
        <Switch
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={appSettings.smartRemindersOn ? colors.highlight : colors.textSecondary}
          ios_backgroundColor={colors.border}
          onValueChange={() => handleToggle('smartRemindersOn')}
          value={appSettings.smartRemindersOn}
        />
      </View>

      <Text style={[typography.body, styles.subSectionTitle, { color: colors.textPrimary, marginTop: 24 }]}>Privacy Settings</Text>
      <View style={styles.settingItem}>
        <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>Hide Stats</Text>
        <Switch
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={appSettings.privacySettings.hideStats ? colors.highlight : colors.textSecondary}
          ios_backgroundColor={colors.border}
          onValueChange={() => handlePrivacyToggle('hideStats')}
          value={appSettings.privacySettings.hideStats}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>Hide Rank</Text>
        <Switch
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={appSettings.privacySettings.hideRank ? colors.highlight : colors.textSecondary}
          ios_backgroundColor={colors.border}
          onValueChange={() => handlePrivacyToggle('hideRank')}
          value={appSettings.privacySettings.hideRank}
        />
      </View>

      {/* Placeholders for other settings like Theme, Notification Style, Daily Summary Time */}
      <Text style={[typography.body, { color: colors.textSecondary, marginTop: 24 }]}>Theme Preference: {appSettings.themePreference}</Text>
      <Text style={[typography.body, { color: colors.textSecondary }]}>Notification Style: {appSettings.notificationStyle}</Text>
      <Text style={[typography.body, { color: colors.textSecondary }]}>Daily Summary: {appSettings.dailySummaryTime}</Text>
      <Text style={[typography.body, { color: colors.textSecondary }]}>Weekly Review: {appSettings.weeklyReviewTime}</Text>

    </View>
  );
};

export default PersonalizationSettings;

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
    marginBottom: 12,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
});
