import React, { useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/AppNavigator';
import type { DraftExercise, DraftSet, Exercise } from '../types';
import {
  createWorkout, addExerciseToWorkout, addSet,
  updateWorkoutBodyParts, getAllSetsForWorkout,
} from '../db/repositories/workoutRepo';
import { getWorkoutExercises } from '../db/repositories/workoutRepo';
import { runPRDetection } from '../hooks/usePR';
import { useUserStore } from '../store/useUserStore';
import { useSubscription } from '../hooks/useSubscription';
import { ExercisePicker } from '../components/ExercisePicker';
import { SetRow } from '../components/SetRow';
import { RestTimer } from '../components/RestTimer';
import { PRCelebration } from '../components/PRCelebration';
import { theme } from '../utils/theme';
import { todayISO } from '../utils/formatters';
import { FREE_REST_TIMER_SECONDS } from '../constants/subscriptionTiers';
import type { PRAlert } from '../types';

let _keyCounter = 0;
function newKey() { return String(++_keyCounter); }
function newSet(num: number): DraftSet {
  return { key: newKey(), weight: '', reps: '', saved: false };
}

export function NewWorkoutScreen({ navigation }: { navigation: BottomTabNavigationProp<TabParamList, '新訓練'> }) {
  const { isPro } = useSubscription();
  const profile = useUserStore(s => s.profile);
  const timerDuration = isPro
    ? (profile?.rest_timer_default ?? 90)
    : FREE_REST_TIMER_SECONDS;

  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([]);
  const [notes,          setNotes]          = useState('');
  const [pickerVisible,  setPickerVisible]  = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [prAlerts,       setPrAlerts]       = useState<PRAlert[]>([]);
  const [showTimer,      setShowTimer]      = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  function addExercise(exercise: Exercise) {
    setDraftExercises(prev => [
      ...prev,
      { key: newKey(), exercise, sets: [newSet(1)] },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function removeExercise(key: string) {
    setDraftExercises(prev => prev.filter(e => e.key !== key));
  }

  function addSetToExercise(exerciseKey: string) {
    setDraftExercises(prev => prev.map(e => {
      if (e.key !== exerciseKey) return e;
      return { ...e, sets: [...e.sets, newSet(e.sets.length + 1)] };
    }));
  }

  function updateSet(exerciseKey: string, setKey: string, field: 'weight' | 'reps', value: string) {
    setDraftExercises(prev => prev.map(e => {
      if (e.key !== exerciseKey) return e;
      return {
        ...e,
        sets: e.sets.map(s => s.key !== setKey ? s : { ...s, [field]: value }),
      };
    }));
  }

  function removeSet(exerciseKey: string, setKey: string) {
    setDraftExercises(prev => prev.map(e => {
      if (e.key !== exerciseKey) return e;
      const sets = e.sets.filter(s => s.key !== setKey);
      return { ...e, sets: sets.length > 0 ? sets : e.sets };
    }));
  }

  async function saveWorkout() {
    if (draftExercises.length === 0) {
      Alert.alert('請先加入動作', '至少需要一個動作先可以儲存訓練。');
      return;
    }

    const hasValidSet = draftExercises.some(e =>
      e.sets.some(s => parseFloat(s.weight) > 0 && parseInt(s.reps, 10) > 0)
    );
    if (!hasValidSet) {
      Alert.alert('請輸入數據', '至少需要一組有效嘅重量同次數。');
      return;
    }

    setSaving(true);
    try {
      const date = todayISO();
      const workoutId = await createWorkout(date, notes);

      // Collect unique body parts
      const bodyParts = [...new Set(draftExercises.map(e => e.exercise.body_part))];
      await updateWorkoutBodyParts(workoutId, bodyParts);

      // Save exercises and sets
      const prInputs: Parameters<typeof runPRDetection>[2] = [];
      for (let i = 0; i < draftExercises.length; i++) {
        const de = draftExercises[i];
        const weId = await addExerciseToWorkout(workoutId, de.exercise.id, i);
        const validSets = de.sets.filter(s => parseFloat(s.weight) > 0 && parseInt(s.reps, 10) > 0);
        for (let j = 0; j < validSets.length; j++) {
          const s = validSets[j];
          await addSet(weId, j + 1, parseFloat(s.weight), parseInt(s.reps, 10));
        }
        prInputs.push({
          exercise_id:   de.exercise.id,
          exercise_name: de.exercise.name,
          sets: validSets.map(s => ({
            weight: parseFloat(s.weight),
            reps:   parseInt(s.reps, 10),
          })),
        });
      }

      // PR detection
      const alerts = await runPRDetection(workoutId, date, prInputs);
      if (alerts.length > 0) {
        setPrAlerts(alerts);
      } else {
        navigation.navigate('歷史');
      }
    } catch (e) {
      Alert.alert('儲存失敗', '請再試一次。');
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}>

      <PRCelebration
        alerts={prAlerts}
        onClose={() => { setPrAlerts([]); navigation.navigate('歷史'); }}
      />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        {/* Notes */}
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="訓練備註（選填）"
          placeholderTextColor={theme.colors.textMuted}
          multiline
        />

        {/* Exercises */}
        {draftExercises.map(de => (
          <View key={de.key} style={styles.exerciseBlock}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseTitle}>
                <Text style={styles.exerciseName}>{de.exercise.name}</Text>
                <Text style={styles.exercisePart}>{de.exercise.body_part}</Text>
              </View>
              <TouchableOpacity onPress={() => removeExercise(de.key)}>
                <Ionicons name="close-circle" size={22} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Set rows */}
            <View style={styles.setHeader}>
              <Text style={[styles.setCol, { flex: 0, width: 32 }]}>#</Text>
              <Text style={styles.setCol}>重量 (kg)</Text>
              <Text style={styles.setCol}>次數</Text>
              <View style={{ width: 30 }} />
            </View>
            {de.sets.map((s, idx) => (
              <SetRow
                key={s.key}
                setNumber={idx + 1}
                weight={s.weight}
                reps={s.reps}
                onWeightChange={v => updateSet(de.key, s.key, 'weight', v)}
                onRepsChange={v => updateSet(de.key, s.key, 'reps', v)}
                onDelete={() => removeSet(de.key, s.key)}
              />
            ))}

            <TouchableOpacity
              style={styles.addSetBtn}
              onPress={() => {
                addSetToExercise(de.key);
                setShowTimer(true);
              }}>
              <Ionicons name="add" size={16} color={theme.colors.primary} />
              <Text style={styles.addSetText}>加一組</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add exercise */}
        <TouchableOpacity style={styles.addExerciseBtn} onPress={() => setPickerVisible(true)}>
          <Ionicons name="add-circle-outline" size={22} color={theme.colors.primary} />
          <Text style={styles.addExerciseText}>加入動作</Text>
        </TouchableOpacity>

        {/* Rest timer */}
        {showTimer && (
          <View style={styles.timerWrap}>
            <View style={styles.timerHeader}>
              <Text style={styles.timerTitle}>休息計時器</Text>
              <TouchableOpacity onPress={() => setShowTimer(false)}>
                <Ionicons name="close" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            {!isPro && (
              <Text style={styles.freeTimer}>免費版：固定 90 秒</Text>
            )}
            <RestTimer defaultDuration={timerDuration} />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={saveWorkout}
          disabled={saving}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.text} />
          <Text style={styles.saveText}>{saving ? '儲存中...' : '完成訓練'}</Text>
        </TouchableOpacity>
      </View>

      <ExercisePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={addExercise}
        excludeIds={draftExercises.map(e => e.exercise.id)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.md, gap: theme.spacing.md },
  notesInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 50,
  },
  exerciseBlock: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exerciseHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  exerciseTitle: { flex: 1 },
  exerciseName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  exercisePart: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  setHeader: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: 2,
    marginBottom: -4,
  },
  setCol: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  addSetText: { color: theme.colors.primary, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.medium },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary + '60',
  },
  addExerciseText: { color: theme.colors.primary, fontWeight: theme.fontWeight.semibold },
  timerWrap: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timerTitle: { color: theme.colors.text, fontWeight: theme.fontWeight.semibold },
  freeTimer: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { color: theme.colors.text, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.md },
});
