import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createTypography } from '@/styles/typography';
import { ConnectedAccountsData } from '@/types/streak';
import {
  CheckCircle, XCircle,
  Mail, Calendar, Google, Apple // Example icons
} from 'lucide-react-native';

type ConnectedAccountsSectionProps = {
  connectedAccounts: ConnectedAccountsData;
};

const IconMap = {
  'google': Google,
  'apple': Apple,
  'calendar': Calendar,
  'mail': Mail, // Example
};

const ConnectedAccountsSection = ({ connectedAccounts }: ConnectedAccountsSectionProps) => {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[typography.subheading, styles.sectionTitle, { color: colors.textPrimary }]}>
        Connected Accounts
      </Text>

      <View>
        {connectedAccounts.accounts.map(account => {
          const IconComponent = IconMap[account.icon as keyof typeof IconMap] || Mail; // Fallback
          return (
            <View key={account.id} style={styles.accountItem}>
              <View style={styles.accountInfo}>
                <IconComponent size={24} color={account.isConnected ? colors.accent : colors.textSecondary} />
                <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 12, flex: 1 }]}>{account.name}</Text>
              </View>
              {account.isConnected ? (
                <View style={styles.statusConnected}>
                  <CheckCircle size={20} color={colors.success} />
                  <Text style={[typography.small, { color: colors.success, marginLeft: 4 }]}>Connected</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.statusDisconnected}>
                  <XCircle size={20} color={colors.warning} />
                  <Text style={[typography.small, { color: colors.warning, marginLeft: 4 }]}>Connect</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ConnectedAccountsSection;

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
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusConnected: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDisconnected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDED', // Light red background for connect button
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
});
