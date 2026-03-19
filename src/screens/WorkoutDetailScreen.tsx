import React, { useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useWorkoutDetail } from '../hooks/useWorkouts';
import { useSubscription } from '../hooks/useSubscription';
import { getOverloadSuggestion } from '../hooks/useProgress';
import { deleteWorkout } from '../db/repositories/workoutRepo';
import { BodyPartBadge } from '../components/BodyPartBadge';
import { PaywallGate } from '../components/PaywallGate';
import { theme } from '../utils/theme';
import { formatDateFull, parseBodyParts } from '../utils/formatters';
import type { BodyPart } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WorkoutDetail'>;
  route: RouteProp<RootStackParamList, 'WorkoutDetail'>;
};

export function WorkoutDetailScreen({ navigation, route }: Props) {
  const { workoutId } = route.params;
  const { workout, exercises, setsMap, loading, refresh } = useWorkoutDetail(workoutId);
  const { isPro } = useSubscription();

  async function handleDelete() {
    Alert.alert('刪除訓練', '確定要刪除呢次訓練嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除', style: 'destructive',
        onPress: async () => {
          await deleteWorkout(workoutId);
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading || !workout) return null;

  const parts = parseBodyParts(workout.body_parts) as BodyPart[];
  const totalVolume = Object.values(setsMap)
    .flat()
    .reduce((sum, s) => sum + s.weight * s.reps, 0);

  return (
    <ScrollView style={styles.container}>
      {/* Header info */}
      <View style={styles.card}>
        <Text style={styles.dateText}>{formatDateFull(workout.date)}</Text>
        <View style={styles.badges}>
          {parts.map(p => <BodyPartBadge key={p} bodyPart={p} />)}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{exercises.length}</Text>
            <Text style={styles.statLabel}>動作</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {Object.values(setsMap).reduce((s, arr) => s + arr.length, 0)}
            </Text>
            <Text style={styles.statLabel}>組數</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}
            </Text>
            <Text style={styles.statLabel}>總量 (kg)</Text>
          </View>
        </View>
        {workout.notes ? (
          <Text style={styles.notes}>{workout.notes}</Text>
        ) : null}
      </View>

      {/* Exercise details */}
      {exercises.map(ex => {
        const sets = setsMap[ex.id] ?? [];
        const suggestion = isPro ? getOverloadSuggestion(sets) : null;
        return (
          <View key={ex.id} style={styles.exerciseCard}>
            <View style={styles.exHeader}>
              <Text style={styles.exName}>{ex.exercise_name}</Text>
              {ex.body_part && <BodyPartBadge bodyPart={ex.body_part} small />}
            </View>

            {/* Sets table */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, styles.thNum]}>#</Text>
                <Text style={styles.th}>重量</Text>
                <Text style={styles.th}>次數</Text>
                <Text style={styles.th}>量</Text>
              </View>
              {sets.map(s => (
                <View key={s.id} style={styles.tableRow}>
                  <Text style={[styles.td, styles.thNum]}>{s.set_number}</Text>
                  <Text style={styles.td}>{s.weight}kg</Text>
                  <Text style={styles.td}>{s.reps}次</Text>
                  <Text style={[styles.td, { color: theme.colors.textSecondary }]}>
                    {(s.weight * s.reps).toFixed(0)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Progressive overload — Pro only */}
            {isPro && suggestion ? (
              <View style={[
                styles.suggestion,
                suggestion.suggestion === 'increase' && styles.suggestionUp,
                suggestion.suggestion === 'decrease' && styles.suggestionDown,
              ]}>
                <Ionicons
                  name={
                    suggestion.suggestion === 'increase' ? 'trending-up' :
                    suggestion.suggestion === 'decrease' ? 'trending-down' : 'remove'
                  }
                  size={16}
                  color={
                    suggestion.suggestion === 'increase' ? theme.colors.success :
                    suggestion.suggestion === 'decrease' ? theme.colors.warning : theme.colors.textSecondary
                  }
                />
                <Text style={styles.suggestionText}>{suggestion.message}</Text>
              </View>
            ) : !isPro ? (
              <TouchableOpacity
                style={styles.proTeaser}
                onPress={() => navigation.navigate('Paywall')}>
                <Ionicons name="lock-closed-outline" size={14} color={theme.colors.primary} />
                <Text style={styles.proTeaserText}>升級 Pro 查看超負荷建議</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}

      {/* Delete */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
        <Text style={styles.deleteText}>刪除訓練</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  card: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateText: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: theme.spacing.sm },
  stat: { alignItems: 'center' },
  statValue: { color: theme.colors.text, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.heavy },
  statLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs },
  notes: { color: theme.colors.textSecondary, fontStyle: 'italic', fontSize: theme.fontSize.sm },
  exerciseCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exName: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, flex: 1 },
  table: { gap: 2 },
  tableHeader: { flexDirection: 'row', gap: theme.spacing.sm, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  tableRow:    { flexDirection: 'row', gap: theme.spacing.sm, paddingVertical: 4 },
  th: { flex: 1, color: theme.colors.textMuted, fontSize: theme.fontSize.xs, textAlign: 'center' },
  td: { flex: 1, color: theme.colors.text, fontSize: theme.fontSize.sm, textAlign: 'center' },
  thNum: { flex: 0, width: 24 },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.sm,
  },
  suggestionUp:   { backgroundColor: theme.colors.success + '15' },
  suggestionDown: { backgroundColor: theme.colors.warning + '15' },
  suggestionText: { flex: 1, color: theme.colors.text, fontSize: theme.fontSize.sm },
  proTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  proTeaserText: { color: theme.colors.primary, fontSize: theme.fontSize.xs },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.danger + '60',
  },
  deleteText: { color: theme.colors.danger, fontWeight: theme.fontWeight.semibold },
});
