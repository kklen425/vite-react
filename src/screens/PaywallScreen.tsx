import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { PurchasesPackage } from 'react-native-purchases';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getOfferings, purchasePackage, restorePurchases } from '../services/purchaseService';
import { useSubscription } from '../hooks/useSubscription';
import { PRO_FEATURES } from '../constants/subscriptionTiers';
import { theme } from '../utils/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Paywall'>;
  route: RouteProp<RootStackParamList, 'Paywall'>;
};

const PRO_BULLETS = [
  { icon: 'time-outline' as const,           text: '完整訓練歷史記錄' },
  { icon: 'trending-up-outline' as const,    text: '所有動作進步圖表' },
  { icon: 'body-outline' as const,           text: '身體數據追蹤（體重、體脂）' },
  { icon: 'timer-outline' as const,          text: '自訂休息計時器' },
  { icon: 'analytics-outline' as const,      text: '漸進超負荷 AI 建議' },
  { icon: 'add-circle-outline' as const,     text: '無限自訂動作' },
  { icon: 'download-outline' as const,       text: '匯出訓練數據' },
];

export function PaywallScreen({ navigation, route }: Props) {
  const [packages,  setPackages]  = useState<PurchasesPackage[]>([]);
  const [selected,  setSelected]  = useState<PurchasesPackage | null>(null);
  const [loadingPkg, setLoadingPkg] = useState(true);
  const { isPro, isLoading } = useSubscription();

  useEffect(() => {
    if (isPro) {
      goToMain();
      return;
    }
    getOfferings().then(offering => {
      const pkgs = offering?.availablePackages ?? [];
      setPackages(pkgs);
      // default to annual if available
      const annual = pkgs.find(p => p.packageType === 'ANNUAL');
      setSelected(annual ?? pkgs[0] ?? null);
      setLoadingPkg(false);
    });
  }, [isPro]);

  function goToMain() {
    navigation.replace('Main');
  }

  async function handlePurchase() {
    if (!selected) return;
    const ok = await purchasePackage(selected);
    if (ok) goToMain();
  }

  async function handleRestore() {
    const ok = await restorePurchases();
    if (ok) goToMain();
  }

  function handleSkip() {
    goToMain();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Skip button */}
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>之後再算</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.heroTitle}>解鎖 Pro 全功能</Text>
          <Text style={styles.heroSub}>認真訓練，認真進步</Text>
        </View>

        {/* Feature list */}
        <View style={styles.featureList}>
          {PRO_BULLETS.map((b, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={b.icon} size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.featureText}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* Packages */}
        {loadingPkg ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <View style={styles.packages}>
            {packages.map(pkg => {
              const isAnnual = pkg.packageType === 'ANNUAL';
              const isSel    = selected?.identifier === pkg.identifier;
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[styles.pkgCard, isSel && styles.pkgSelected]}
                  onPress={() => setSelected(pkg)}>
                  {isAnnual && (
                    <View style={styles.bestBadge}>
                      <Text style={styles.bestText}>最抵！省 50%</Text>
                    </View>
                  )}
                  <View style={styles.pkgRow}>
                    <View style={[styles.radio, isSel && styles.radioActive]}>
                      {isSel && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.pkgInfo}>
                      <Text style={styles.pkgTitle}>
                        {isAnnual ? '年費方案' : '月費方案'}
                      </Text>
                      <Text style={styles.pkgPrice}>
                        {pkg.product.priceString}
                        <Text style={styles.pkgPer}>{isAnnual ? ' / 年' : ' / 月'}</Text>
                      </Text>
                      {isAnnual && (
                        <Text style={styles.pkgPerMonth}>
                          即每月 {
                            pkg.product.price > 0
                              ? (pkg.product.price / 12).toFixed(2)
                              : '--'
                          } {pkg.product.currencyCode}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, (!selected || isLoading) && styles.ctaDisabled]}
          onPress={handlePurchase}
          disabled={!selected || isLoading}>
          {isLoading
            ? <ActivityIndicator color={theme.colors.text} />
            : <Text style={styles.ctaText}>立即升級 Pro →</Text>
          }
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>已訂閱？恢復購買</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          訂閱將由 Apple / Google 自動續期。可隨時喺設定取消。
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.xl, gap: theme.spacing.lg, flexGrow: 1 },
  skipBtn: { alignSelf: 'flex-end' },
  skipText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  hero: { alignItems: 'center', gap: theme.spacing.sm },
  crown: { fontSize: 56 },
  heroTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.heavy,
    textAlign: 'center',
  },
  heroSub: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, textAlign: 'center' },
  featureList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { color: theme.colors.text, fontSize: theme.fontSize.sm, flex: 1 },
  packages: { gap: theme.spacing.sm },
  pkgCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  pkgSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '12' },
  bestBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderBottomLeftRadius: theme.radius.sm,
  },
  bestText: { color: theme.colors.text, fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.bold },
  pkgRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: theme.colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  pkgInfo: { flex: 1 },
  pkgTitle: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold },
  pkgPrice: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold },
  pkgPer: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  pkgPerMonth: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs },
  cta: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.heavy },
  restoreBtn: { alignItems: 'center', padding: theme.spacing.sm },
  restoreText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  legal: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
  },
});
