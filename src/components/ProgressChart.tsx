import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { ProgressPoint } from '../types';
import { formatDateShort } from '../utils/formatters';
import { theme } from '../utils/theme';

const W = Dimensions.get('window').width;

interface Props {
  points: ProgressPoint[];
  metric: 'weight' | 'volume';
  title?: string;
}

export function ProgressChart({ points, metric, title }: Props) {
  if (points.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>需要至少 2 次訓練數據</Text>
      </View>
    );
  }

  // Take last 12 points
  const slice  = points.slice(-12);
  const labels = slice.map(p => formatDateShort(p.date));
  const data   = slice.map(p => metric === 'weight' ? p.weight : p.volume);

  return (
    <View style={styles.wrap}>
      {title && <Text style={styles.title}>{title}</Text>}
      <LineChart
        data={{
          labels,
          datasets: [{ data, color: () => theme.colors.primary }],
        }}
        width={W - 32}
        height={200}
        yAxisSuffix={metric === 'weight' ? 'kg' : ''}
        chartConfig={{
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          color: () => theme.colors.primary,
          labelColor: () => theme.colors.textSecondary,
          strokeWidth: 2,
          propsForDots: { r: '4', strokeWidth: '2', stroke: theme.colors.primary },
          propsForBackgroundLines: { stroke: theme.colors.border },
          decimalPlaces: metric === 'weight' ? 1 : 0,
        }}
        bezier
        style={styles.chart}
        withInnerLines
        withOuterLines={false}
        withVerticalLines={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.sm },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    paddingHorizontal: theme.spacing.md,
  },
  chart: { borderRadius: theme.radius.md },
  empty: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyText: { color: theme.colors.textMuted, fontSize: theme.fontSize.sm },
});
