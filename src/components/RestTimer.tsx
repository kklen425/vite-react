import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimerStore } from '../store/useTimerStore';
import { formatTimer } from '../utils/formatters';
import { theme } from '../utils/theme';

interface Props {
  defaultDuration: number;
  onComplete?: () => void;
}

export function RestTimer({ defaultDuration, onComplete }: Props) {
  const { isRunning, secondsLeft, start, stop, reset } = useTimerStore();

  useEffect(() => {
    if (!isRunning && secondsLeft === 0 && onComplete) {
      onComplete();
    }
  }, [isRunning, secondsLeft, onComplete]);

  const progress = secondsLeft / (defaultDuration || 1);
  const isWarning = secondsLeft <= 10 && isRunning;

  return (
    <View style={styles.container}>
      <View style={[styles.timerWrap, isWarning && styles.warning]}>
        <Text style={[styles.time, isWarning && styles.warningText]}>
          {formatTimer(secondsLeft)}
        </Text>
        <Text style={styles.label}>休息計時</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={reset}>
          <Ionicons name="refresh" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, isRunning ? styles.btnStop : styles.btnStart]}
          onPress={() => isRunning ? stop() : start(defaultDuration)}>
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={20}
            color={theme.colors.text}
          />
          <Text style={styles.btnText}>{isRunning ? '暫停' : '開始'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timerWrap: { alignItems: 'center', padding: theme.spacing.sm },
  warning: {},
  time: {
    color: theme.colors.text,
    fontSize: theme.fontSize.hero,
    fontWeight: theme.fontWeight.heavy,
    fontVariant: ['tabular-nums'],
  },
  warningText: { color: theme.colors.danger },
  label: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  buttons: { flexDirection: 'row', gap: theme.spacing.sm },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  btnSecondary: { backgroundColor: theme.colors.surfaceAlt, flex: 0, paddingHorizontal: theme.spacing.md },
  btnStart: { backgroundColor: theme.colors.primary },
  btnStop:  { backgroundColor: theme.colors.warning },
  btnText:  { color: theme.colors.text, fontWeight: theme.fontWeight.semibold },
});
