import React, { useState } from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View, SafeAreaView,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { updateUserProfile, markOnboardingComplete } from '../db/repositories/progressRepo';
import { useUserStore } from '../store/useUserStore';
import { theme } from '../utils/theme';
import type { Goal, Experience } from '../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'> };

const GOALS: { value: Goal; label: string; emoji: string; desc: string }[] = [
  { value: '增肌', label: '增肌',  emoji: '💪', desc: '增加肌肉量，提升力量' },
  { value: '減脂', label: '減脂',  emoji: '🔥', desc: '燃燒脂肪，雕塑身型' },
  { value: '健體', label: '健體',  emoji: '⚡', desc: '維持健康，全面均衡' },
];

const TRAINING_DAYS = [2, 3, 4, 5, 6];

const EXPERIENCES: { value: Experience; label: string; desc: string }[] = [
  { value: '新手', label: '新手', desc: '訓練少於 1 年' },
  { value: '中級', label: '中級', desc: '訓練 1–3 年' },
  { value: '高級', label: '高級', desc: '訓練超過 3 年' },
];

export function OnboardingScreen({ navigation }: Props) {
  const [step,     setStep]     = useState(0);
  const [goal,     setGoal]     = useState<Goal | null>(null);
  const [days,     setDays]     = useState<number | null>(null);
  const [exp,      setExp]      = useState<Experience | null>(null);
  const loadProfile = useUserStore(s => s.loadProfile);

  const steps = ['訓練目標', '訓練頻率', '訓練經驗'];

  async function finish() {
    if (!goal || !days || !exp) return;
    await updateUserProfile({
      goal,
      training_days_per_week: days,
      experience: exp,
    });
    await markOnboardingComplete();
    await loadProfile();
    navigation.replace('Paywall', { fromOnboarding: true });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Progress dots */}
        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.hero}>健身記錄</Text>

        {step === 0 && (
          <>
            <Text style={styles.title}>你嘅訓練目標係？</Text>
            <Text style={styles.sub}>幫你個性化你嘅訓練計劃</Text>
            <View style={styles.options}>
              {GOALS.map(g => (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.optionCard, goal === g.value && styles.optionSelected]}
                  onPress={() => setGoal(g.value)}>
                  <Text style={styles.optionEmoji}>{g.emoji}</Text>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, goal === g.value && styles.optionLabelActive]}>
                      {g.label}
                    </Text>
                    <Text style={styles.optionDesc}>{g.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.title}>每星期練幾多日？</Text>
            <Text style={styles.sub}>規律訓練係進步嘅關鍵</Text>
            <View style={styles.daysWrap}>
              {TRAINING_DAYS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayBtn, days === d && styles.dayBtnActive]}
                  onPress={() => setDays(d)}>
                  <Text style={[styles.dayNum, days === d && styles.dayNumActive]}>{d}</Text>
                  <Text style={[styles.dayLabel, days === d && styles.dayLabelActive]}>日</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>你嘅訓練經驗？</Text>
            <Text style={styles.sub}>有助提供合適嘅建議</Text>
            <View style={styles.options}>
              {EXPERIENCES.map(e => (
                <TouchableOpacity
                  key={e.value}
                  style={[styles.optionCard, exp === e.value && styles.optionSelected]}
                  onPress={() => setExp(e.value)}>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, exp === e.value && styles.optionLabelActive]}>
                      {e.label}
                    </Text>
                    <Text style={styles.optionDesc}>{e.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={styles.navRow}>
          {step > 0 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
              <Text style={styles.backText}>← 返回</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextBtn,
              (step === 0 && !goal) || (step === 1 && !days) || (step === 2 && !exp)
                ? styles.nextDisabled : null,
            ]}
            disabled={
              (step === 0 && !goal) || (step === 1 && !days) || (step === 2 && !exp)
            }
            onPress={() => step < 2 ? setStep(step + 1) : finish()}>
            <Text style={styles.nextText}>{step < 2 ? '下一步 →' : '開始訓練 🚀'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.xl, gap: theme.spacing.lg, flexGrow: 1 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.border },
  dotActive: { backgroundColor: theme.colors.primary, width: 24 },
  hero: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.hero,
    fontWeight: theme.fontWeight.heavy,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    textAlign: 'center',
  },
  sub: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    marginTop: -theme.spacing.sm,
  },
  options: { gap: theme.spacing.sm },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  optionEmoji: { fontSize: 32 },
  optionText: { flex: 1 },
  optionLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  optionLabelActive: { color: theme.colors.primary },
  optionDesc: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, marginTop: 2 },
  daysWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  dayBtn: {
    width: 64,
    height: 80,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '20' },
  dayNum: { color: theme.colors.text, fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.heavy },
  dayNumActive: { color: theme.colors.primary },
  dayLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  dayLabelActive: { color: theme.colors.primary },
  navRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: 'auto' },
  backBtn: {
    flex: 0,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backText: { color: theme.colors.textSecondary, fontWeight: theme.fontWeight.semibold },
  nextBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  nextDisabled: { opacity: 0.4 },
  nextText: { color: theme.colors.text, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.md },
});
