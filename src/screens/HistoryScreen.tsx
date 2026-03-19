import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { useWorkoutList } from '../hooks/useWorkouts';
import { useSubscription } from '../hooks/useSubscription';
import { getAllSetsForWorkout, getWorkoutExercises } from '../db/repositories/workoutRepo';
import { WorkoutCard } from '../components/WorkoutCard';
import { EmptyState } from '../components/EmptyState';
import { theme } from '../utils/theme';
import { FREE_HISTORY_DAYS } from '../constants/subscriptionTiers';
import type { Workout } from '../types';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, '歷史'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HistoryScreen({ navigation }: { navigation: NavProp }) {
  const { isPro } = useSubscription();
  const limitDays = isPro ? undefined : FREE_HISTORY_DAYS;
  const { workouts, loading, refresh } = useWorkoutList(limitDays);
  const [metaMap, setMetaMap] = useState<Record<number, { count: number; volume: number }>>({});

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  useEffect(() => {
    // Load exercise count + volume for each workout
    (async () => {
      const map: Record<number, { count: number; volume: number }> = {};
      for (const w of workouts) {
        const exes = await getWorkoutExercises(w.id);
        const sets = await getAllSetsForWorkout(w.id);
        const vol  = sets.reduce((s, set) => s + set.weight * set.reps, 0);
        map[w.id] = { count: exes.length, volume: vol };
      }
      setMetaMap(map);
    })();
  }, [workouts]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.colors.primary} />}>

      {!isPro && (
        <TouchableOpacity
          style={styles.proTeaser}
          onPress={() => navigation.navigate('Paywall')}>
          <Ionicons name="lock-closed-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.proTeaserText}>
            免費版只顯示最近 7 日 · 升級 Pro 查看完整歷史
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      )}

      <View style={styles.list}>
        {workouts.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="未有訓練記錄"
            desc="完成第一次訓練後會喺呢度顯示"
          />
        ) : (
          workouts.map(w => (
            <WorkoutCard
              key={w.id}
              workout={w}
              onPress={() => navigation.navigate('WorkoutDetail', { workoutId: w.id })}
              exerciseCount={metaMap[w.id]?.count}
              totalVolume={metaMap[w.id]?.volume}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  proTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '15',
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  proTeaserText: { flex: 1, color: theme.colors.primary, fontSize: theme.fontSize.sm },
  list: { padding: theme.spacing.md },
});
