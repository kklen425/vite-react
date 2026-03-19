import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Exercise } from '../types';
import { BodyPartBadge } from './BodyPartBadge';
import { theme } from '../utils/theme';

interface Props {
  exercise: Exercise;
  onPress?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  showDelete?: boolean;
}

export function ExerciseCard({ exercise, onPress, onDelete, selected, showDelete }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.left}>
        <Text style={styles.name}>{exercise.name}</Text>
        <BodyPartBadge bodyPart={exercise.body_part} small />
      </View>
      <View style={styles.right}>
        {exercise.is_custom === 1 && (
          <View style={styles.customBadge}>
            <Text style={styles.customText}>自訂</Text>
          </View>
        )}
        {selected && (
          <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
        )}
        {showDelete && onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  left: { flex: 1, gap: 6 },
  right: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  name: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  customBadge: {
    backgroundColor: theme.colors.warning + '25',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  customText: { color: theme.colors.warning, fontSize: theme.fontSize.xs },
  deleteBtn: { padding: 4 },
});
