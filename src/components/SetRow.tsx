import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

interface Props {
  setNumber: number;
  weight: string;
  reps: string;
  onWeightChange: (v: string) => void;
  onRepsChange: (v: string) => void;
  onDelete: () => void;
  isPR?: boolean;
}

export function SetRow({ setNumber, weight, reps, onWeightChange, onRepsChange, onDelete, isPR }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.numBadge, isPR && styles.prBadge]}>
        <Text style={[styles.num, isPR && styles.prNum]}>
          {isPR ? '🏆' : setNumber}
        </Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>重量 (kg)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={onWeightChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={theme.colors.textMuted}
          selectTextOnFocus
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>次數</Text>
        <TextInput
          style={styles.input}
          value={reps}
          onChangeText={onRepsChange}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={theme.colors.textMuted}
          selectTextOnFocus
        />
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.del}>
        <Ionicons name="close-circle" size={22} color={theme.colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  numBadge: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prBadge: { backgroundColor: theme.colors.gold + '30' },
  num: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.bold },
  prNum: { color: theme.colors.gold },
  field: { flex: 1 },
  label: { color: theme.colors.textMuted, fontSize: theme.fontSize.xs, marginBottom: 4 },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  del: { padding: 4 },
});
