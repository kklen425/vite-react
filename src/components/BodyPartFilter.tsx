import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { BodyPart } from '../types';
import { BODY_PARTS } from '../constants/bodyParts';
import { theme } from '../utils/theme';

interface Props {
  selected: BodyPart | null;
  onSelect: (bp: BodyPart | null) => void;
}

export function BodyPartFilter({ selected, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={[styles.chip, !selected && styles.chipActive]}
        onPress={() => onSelect(null)}>
        <Text style={[styles.label, !selected && styles.labelActive]}>全部</Text>
      </TouchableOpacity>
      {BODY_PARTS.map(bp => {
        const active = selected === bp.label;
        return (
          <TouchableOpacity
            key={bp.label}
            style={[styles.chip, active && { backgroundColor: bp.color + '30', borderColor: bp.color }]}
            onPress={() => onSelect(active ? null : bp.label)}>
            <Text style={[styles.label, active && { color: bp.color }]}>
              {bp.emoji} {bp.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
  },
  chip: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    backgroundColor: theme.colors.primary + '30',
    borderColor: theme.colors.primary,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  labelActive: {
    color: theme.colors.primary,
  },
});
