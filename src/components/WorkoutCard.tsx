import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Workout } from '../types';
import { BodyPartBadge } from './BodyPartBadge';
import { formatDate, parseBodyParts } from '../utils/formatters';
import { theme } from '../utils/theme';
import type { BodyPart } from '../types';

interface Props {
  workout: Workout;
  onPress: () => void;
  exerciseCount?: number;
  totalVolume?: number;
}

export function WorkoutCard({ workout, onPress, exerciseCount, totalVolume }: Props) {
  const parts = parseBodyParts(workout.body_parts) as BodyPart[];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(workout.date)}</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </View>
      <View style={styles.badges}>
        {parts.map(p => <BodyPartBadge key={p} bodyPart={p} small />)}
      </View>
      {(exerciseCount !== undefined || totalVolume !== undefined) && (
        <View style={styles.stats}>
          {exerciseCount !== undefined && (
            <View style={styles.stat}>
              <Ionicons name="barbell-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>{exerciseCount} 個動作</Text>
            </View>
          )}
          {totalVolume !== undefined && (
            <View style={styles.stat}>
              <Ionicons name="trending-up-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>{totalVolume.toLocaleString()} kg 總量</Text>
            </View>
          )}
        </View>
      )}
      {workout.notes ? (
        <Text style={styles.notes} numberOfLines={1}>{workout.notes}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stats: { flexDirection: 'row', gap: theme.spacing.md },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  notes: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm, fontStyle: 'italic' },
});
