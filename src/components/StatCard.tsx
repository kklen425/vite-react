import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

interface Props {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color?: string;
  sub?: string;
}

export function StatCard({ label, value, icon, color = theme.colors.primary, sub }: Props) {
  return (
    <View style={[styles.card, { borderColor: color + '40' }]}>
      <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    minWidth: 90,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
  },
  sub: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
  },
});
