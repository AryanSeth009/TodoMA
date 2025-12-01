import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { Crown, Zap } from 'lucide-react-native'; // Icons

const PremiumUpsellBanner = () => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  const handleUpgradePress = () => {
    // Implement navigation to premium/upgrade screen
    console.log('Navigate to Upgrade screen');
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.highlight }]}>
      <View style={styles.bannerContent}>
        <Crown size={32} color={colors.background} />
        <View style={styles.textContainer}>
          <Text style={[typography.subheading, { color: colors.background, fontWeight: 'bold' }]}>
            Unlock TodoMA Pro!
          </Text>
          <Text style={[typography.small, { color: colors.background, marginTop: 4 }]}>
            Access deeper analytics, unlimited habits, advanced AI, and more.
          </Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: colors.accent }]} onPress={handleUpgradePress}>
        <Zap size={20} color={colors.background} />
        <Text style={[typography.body, { color: colors.background, marginLeft: 8, fontWeight: 'bold' }]}>
          Upgrade to Pro
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PremiumUpsellBanner;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 10,
  },
});
