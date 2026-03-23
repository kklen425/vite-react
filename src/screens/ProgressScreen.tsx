import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { getAllExercises } from '../db/repositories/exerciseRepo';
import { useExerciseProgress } from '../hooks/useProgress';
import { useAllPRs } from '../hooks/usePR';
import { useSubscription } from '../hooks/useSubscription';
import { ProgressChart } from '../components/ProgressChart';
import { EmptyState } from '../components/EmptyState';
import { theme } from '../utils/theme';
import type { Exercise } from '../types';
import { FREE_CHART_LIMIT } from '../constants/subscriptionTiers';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, '進步'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function ProgressScreen({ navigation }: { navigation: NavProp }) {
  const { isPro } = useSubscription();
  const [exercises,     setExercises]     = useState<Exercise[]>([]);
  const [selectedEx,    setSelectedEx]    = useState<Exercise | null>(null);
  const [chartMetric,   setChartMetric]   = useState<'weight' | 'volume'>('weight');
  const { points, loading } = useExerciseProgress(selectedEx?.id ?? null);
  const { prs } = useAllPRs();

  useEffect(() => {
    getAllExercises().then(list => {
      setExercises(list);
      if (list.length > 0) setSelectedEx(list[0]);
    });
  }, []);

  // Free: only 1 chart; Pro: all
  const visibleExercises = isPro ? exercises : exercises.slice(0, FREE_CHART_LIMIT);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* PR highlights */}
      {prs.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>個人記錄 🏆</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.prScroll}>
            {prs.slice(0, 6).map(pr => (
              <View key={pr.id} style={styles.prCard}>
                <Text style={styles.prName}>{pr.exercise_name}</Text>
                <Text style={styles.prWeight}>{pr.max_weight}kg</Text>
                <Text style={styles.prReps}>{pr.max_reps}次</Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {/* Chart selector */}
      <Text style={styles.sectionTitle}>進步圖表</Text>

      <View style={styles.metricToggle}>
        {(['weight', 'volume'] as const).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.metricBtn, chartMetric === m && styles.metricBtnActive]}
            onPress={() => setChartMetric(m)}>
            <Text style={[styles.metricText, chartMetric === m && styles.metricTextActive]}>
              {m === 'weight' ? '最大重量' : '訓練總量'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Exercise picker row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exPicker}>
        {visibleExercises.map(ex => (
          <TouchableOpacity
            key={ex.id}
            style={[styles.exChip, selectedEx?.id === ex.id && styles.exChipActive]}
            onPress={() => setSelectedEx(ex)}>
            <Text style={[styles.exChipText, selectedEx?.id === ex.id && styles.exChipTextActive]}>
              {ex.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pro upsell if not pro */}
      {!isPro && exercises.length > FREE_CHART_LIMIT && (
        <TouchableOpacity
          style={styles.proTeaser}
          onPress={() => navigation.navigate('Paywall')}>
          <Ionicons name="lock-closed-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.proTeaserText}>
            升級 Pro 解鎖全部 {exercises.length} 個動作圖表
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      )}

      {/* Chart */}
      {selectedEx && (
        <ProgressChart
          points={points}
          metric={chartMetric}
          title={`${selectedEx.name} — ${chartMetric === 'weight' ? '最大重量' : '訓練總量'}`}
        />
      )}

      {exercises.length === 0 && (
        <EmptyState
          icon="trending-up-outline"
          title="未有訓練數據"
          desc="完成訓練後圖表會自動更新"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: 40 },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  prScroll: { marginHorizontal: -theme.spacing.md },
  prCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginLeft: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gold + '40',
    minWidth: 90,
  },
  prName: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs, textAlign: 'center' },
  prWeight: { color: theme.colors.gold, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.heavy },
  prReps: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs },
  metricToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 4,
  },
  metricBtn: { flex: 1, padding: theme.spacing.sm, borderRadius: theme.radius.sm, alignItems: 'center' },
  metricBtnActive: { backgroundColor: theme.colors.primary },
  metricText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  metricTextActive: { color: theme.colors.text, fontWeight: theme.fontWeight.semibold },
  exPicker: { marginHorizontal: -theme.spacing.md },
  exChip: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginLeft: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  exChipText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  exChipTextActive: { color: theme.colors.text, fontWeight: theme.fontWeight.semibold },
  proTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '15',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  proTeaserText: { flex: 1, color: theme.colors.primary, fontSize: theme.fontSize.sm },
});
