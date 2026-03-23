import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { PRAlert } from '../types';
import { theme } from '../utils/theme';

interface Props {
  alerts: PRAlert[];
  onClose: () => void;
}

const TYPE_LABEL: Record<PRAlert['type'], string> = {
  weight: '最大重量',
  reps:   '最多次數',
  volume: '最大訓練量',
};

const TYPE_UNIT: Record<PRAlert['type'], string> = {
  weight: 'kg',
  reps:   '次',
  volume: 'kg',
};

export function PRCelebration({ alerts, onClose }: Props) {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (alerts.length > 0) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 6,
      }).start();
    } else {
      scale.setValue(0);
    }
  }, [alerts, scale]);

  if (alerts.length === 0) return null;

  return (
    <Modal transparent animationType="fade" visible={alerts.length > 0}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text style={styles.emoji}>🏆</Text>
          <Text style={styles.title}>新個人記錄！</Text>
          <Text style={styles.sub}>恭喜你打破咗以下記錄</Text>
          {alerts.map((a, i) => (
            <View key={i} style={styles.alertRow}>
              <Text style={styles.exerciseName}>{a.exerciseName}</Text>
              <Text style={styles.detail}>
                {TYPE_LABEL[a.type]}: <Text style={styles.value}>
                  {a.type === 'volume'
                    ? a.value.toLocaleString()
                    : a.value}
                  {TYPE_UNIT[a.type]}
                </Text>
              </Text>
            </View>
          ))}
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>🎉 繼續加油！</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    margin: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.gold,
    width: '85%',
  },
  emoji: { fontSize: 56 },
  title: {
    color: theme.colors.gold,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.heavy,
  },
  sub: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, marginBottom: theme.spacing.sm },
  alertRow: {
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    width: '100%',
    gap: 4,
  },
  exerciseName: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold },
  detail: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  value: { color: theme.colors.primary, fontWeight: theme.fontWeight.bold },
  btn: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  btnText: { color: theme.colors.text, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.md },
});
