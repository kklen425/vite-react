import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BodyPart } from '../types';
import { BODY_PART_COLOR } from '../constants/bodyParts';
import { theme } from '../utils/theme';

interface Props {
  bodyPart: BodyPart;
  small?: boolean;
}

export function BodyPartBadge({ bodyPart, small }: Props) {
  const color = BODY_PART_COLOR[bodyPart] ?? theme.colors.textMuted;
  return (
    <View style={[styles.badge, { backgroundColor: color + '25', borderColor: color + '60' }, small && styles.small]}>
      <Text style={[styles.text, { color }, small && styles.smallText]}>{bodyPart}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  smallText: {
    fontSize: theme.fontSize.xs,
  },
});
