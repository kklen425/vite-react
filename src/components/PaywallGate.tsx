import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubscription } from '../hooks/useSubscription';
import type { ProFeature } from '../constants/subscriptionTiers';
import { PRO_FEATURES } from '../constants/subscriptionTiers';
import { theme } from '../utils/theme';

type RootStackParamList = { Paywall: undefined };

interface Props {
  feature: ProFeature;
  children: React.ReactNode;
}

export function PaywallGate({ feature, children }: Props) {
  const { isPro } = useSubscription();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (isPro) return <>{children}</>;

  return (
    <View style={styles.gate}>
      <View style={styles.iconWrap}>
        <Ionicons name="lock-closed" size={32} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>Pro 功能</Text>
      <Text style={styles.desc}>{PRO_FEATURES[feature]} 需要升級至 Pro 版</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('Paywall')}>
        <Text style={styles.btnText}>解鎖 Pro →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  gate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  desc: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
  },
  btn: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  btnText: { color: theme.colors.text, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.md },
});
