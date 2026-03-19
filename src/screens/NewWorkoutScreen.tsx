import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, radii, spacing } from '../theme/tokens';
import { screenContainer, screenPad, accentBtnStyle } from '../theme/styles';
import { useApp } from '../context/AppContext';
import { ExerciseCard } from '../components/ExerciseCard';
import { BodyPartChip } from '../components/BodyPartChip';
import { RestTimer } from '../components/RestTimer';
import { PRCelebration } from '../components/PRCelebration';
import { EmptyState } from '../components/EmptyState';
import { ExercisePicker } from './ExercisePicker';
import { useRestTimer } from '../hooks/useRestTimer';
import { genId } from '../utils/id';
import { todayISO } from '../utils/dates';
import type { WorkoutExercise } from '../types';

export function NewWorkoutScreen() {
  const navigate = useNavigate();
  const { workouts: { saveWorkout }, prefs: { prefs } } = useApp();
  const restTimer = useRestTimer(prefs.restTimerSeconds);

  const [date] = useState(todayISO());
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [filterPart, setFilterPart] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [prExercise, setPRExercise] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const addExercise = (name: string, bodyPart: string) => {
    const newEx: WorkoutExercise = {
      id: genId(),
      exerciseName: name,
      bodyPart,
      sets: [{ id: genId(), weight: 0, reps: 0, completed: false }],
    };
    setExercises(prev => [...prev, newEx]);
  };

  const updateExercise = (idx: number, updated: WorkoutExercise) => {
    setExercises(prev => prev.map((e, i) => i === idx ? updated : e));
  };

  const deleteExercise = (idx: number) => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const filteredExercises = filterPart
    ? exercises.filter(e => e.bodyPart === filterPart)
    : exercises;

  const handleSave = () => {
    if (exercises.length === 0) return;
    setSaving(true);
    const { newPRExercise } = saveWorkout(exercises, date);
    if (newPRExercise) {
      setPRExercise(newPRExercise);
    } else {
      navigate('/history');
    }
    setSaving(false);
  };

  // Active body parts in this workout
  const activeParts = [...new Set(exercises.map(e => e.bodyPart))];

  return (
    <div style={screenContainer}>
      <div style={screenPad}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>新訓練</div>
          <div style={{ fontSize: 12, color: colors.muted }}>
            {new Date(date + 'T00:00:00').toLocaleDateString('zh-HK', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Body part filter chips */}
        {activeParts.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            <BodyPartChip bodyPart="全部" selected={!filterPart} onClick={() => setFilterPart(null)} />
            {activeParts.map(bp => (
              <BodyPartChip
                key={bp}
                bodyPart={bp}
                selected={filterPart === bp}
                onClick={() => setFilterPart(filterPart === bp ? null : bp)}
              />
            ))}
          </div>
        )}

        {/* Exercises */}
        {filteredExercises.length === 0 && exercises.length === 0 ? (
          <EmptyState
            icon="🏋️"
            title="未加動作"
            subtitle="點擊下方按鈕加入動作開始訓練"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.gap }}>
            {(filterPart ? exercises.filter(e => e.bodyPart === filterPart) : exercises).map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                onUpdate={updated => updateExercise(exercises.indexOf(ex), updated)}
                onDelete={() => deleteExercise(exercises.indexOf(ex))}
              />
            ))}
          </div>
        )}

        {/* Add exercise button */}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          style={{
            background: colors.card2,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.button,
            color: colors.accent,
            fontSize: 14,
            fontWeight: 700,
            padding: '12px',
            cursor: 'pointer',
            width: '100%',
            marginTop: 12,
            textAlign: 'center',
          }}
        >
          ＋ 加動作
        </button>

        {/* Save button */}
        <button
          style={{
            ...accentBtnStyle,
            marginTop: 12,
            opacity: exercises.length === 0 || saving ? 0.5 : 1,
          }}
          onClick={handleSave}
          disabled={exercises.length === 0 || saving}
        >
          💪 儲存訓練
        </button>
      </div>

      {/* Rest timer */}
      <RestTimer
        seconds={restTimer.seconds}
        running={restTimer.running}
        onAddTime={restTimer.addTime}
        onStop={restTimer.stop}
      />

      {/* Exercise picker */}
      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addExercise}
        selectedExercises={exercises.map(e => e.exerciseName)}
      />

      {/* PR Celebration */}
      {prExercise && (
        <PRCelebration
          exerciseName={prExercise}
          onClose={() => { setPRExercise(null); navigate('/history'); }}
        />
      )}
    </div>
  );
}
