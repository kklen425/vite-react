import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { useWorkoutList, useWorkoutCount } from '../hooks/useWorkouts';
import { useRecentPRs } from '../hooks/usePR';
import { useUserStore } from '../store/useUserStore';
import { useSubscription } from '../hooks/useSubscription';
import { StatCard } from '../components/StatCard';
import { WorkoutCard } from '../components/WorkoutCard';
import { EmptyState } from '../components/EmptyState';
import { theme } from '../utils/theme';
import { formatDate, todayISO } from '../utils/formatters';
import { FREE_HISTORY_DAYS } from '../constants/subscriptionTiers';
import { getWorkoutExercises, getAllSetsForWorkout } from '../db/repositories/workoutRepo';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, '首頁'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen({ navigation }: { navigation: NavProp }) {
  const { isPro } = useSubscription();
  const limitDays = isPro ? undefined : FREE_HISTORY_DAYS;
  const { workouts, loading, refresh } = useWorkoutList(limitDays);
  const { prs } = useRecentPRs(3);
  const profile = useUserStore(s => s.profile);
  const totalWorkouts = useWorkoutCount();
  const [weekVolume, setWeekVolume] = useState(0);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  useEffect(() => {
    // Calculate this week's total volume
    (async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      const recent = workouts.filter(w => new Date(w.date) >= cutoff);
      let vol = 0;
      for (const w of recent) {
        const sets = await getAllSetsForWorkout(w.id);
        vol += sets.reduce((s, set) => s + set.weight * set.reps, 0);
      }
      setWeekVolume(vol);
    })();
  }, [workouts]);

  const todayWorkout = workouts.find(w => w.date === todayISO());
  const recentWorkouts = workouts.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.colors.primary} />}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {profile?.goal ? `目標：${profile.goal}` : '健身記錄'}
          </Text>
          <Text style={styles.date}>{formatDate(todayISO())}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard
          label="本周訓練量"
          value={weekVolume >= 1000 ? `${(weekVolume / 1000).toFixed(1)}k` : String(weekVolume)}
          icon="barbell-outline"
          color={theme.colors.primary}
          sub="kg"
        />
        <StatCard
          label="總訓練次數"
          value={String(totalWorkouts)}
          icon="calendar-outline"
          color={theme.colors.success}
          sub="次"
        />
        <StatCard
          label="個人記錄"
          value={String(prs.length)}
          icon="trophy-outline"
          color={theme.colors.gold}
          sub="個"
        />
      </View>

      {/* Quick start */}
      <TouchableOpacity
        style={styles.quickStart}
        onPress={() => (navigation as unknown as BottomTabNavigationProp<TabParamList>).navigate('新訓練')}>
        <Ionicons name="add-circle" size={24} color={theme.colors.text} />
        <Text style={styles.quickText}>
          {todayWorkout ? '繼續今日訓練' : '開始新訓練'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
      </TouchableOpacity>

      {/* Recent PRs */}
      {prs.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>最近 PR 🏆</Text>
          {prs.map(pr => (
            <View key={pr.id} style={styles.prRow}>
              <View style={styles.prIcon}>
                <Ionicons name="trophy" size={16} color={theme.colors.gold} />
              </View>
              <Text style={styles.prExercise}>{pr.exercise_name}</Text>
              <Text style={styles.prValue}>{pr.max_weight}kg × {pr.max_reps}次</Text>
            </View>
          ))}
        </>
      )}

      {/* Recent workouts */}
      <Text style={styles.sectionTitle}>最近訓練</Text>
      {recentWorkouts.length === 0 ? (
        <EmptyState
          icon="barbell-outline"
          title="未有訓練記錄"
          desc="開始第一次訓練吧！"
        />
      ) : (
        recentWorkouts.map(w => (
          <WorkoutCard
            key={w.id}
            workout={w}
            onPress={() => navigation.navigate('WorkoutDetail', { workoutId: w.id })}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  greeting: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold },
  date: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  settingsBtn: { padding: theme.spacing.sm },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  quickStart: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  quickText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gold + '40',
  },
  prIcon: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prExercise: { flex: 1, color: theme.colors.text, fontSize: theme.fontSize.sm },
  prValue: { color: theme.colors.gold, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold },
});
