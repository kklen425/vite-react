import type { CSSProperties } from 'react';
import type { WorkoutExercise, WorkoutSet } from '../types';
import { colors, radii, spacing, bodyPartColors } from '../theme/tokens';
import { SetRow } from './SetRow';
import { genId } from '../utils/id';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  onUpdate: (updated: WorkoutExercise) => void;
  onDelete: () => void;
  proSuggestion?: string;
  onSetDone?: (setIndex: number) => void;
}

export function ExerciseCard({ exercise, onUpdate, onDelete, proSuggestion }: ExerciseCardProps) {
  const bpColor = bodyPartColors[exercise.bodyPart] ?? colors.muted;

  const addSet = () => {
    const last = exercise.sets[exercise.sets.length - 1];
    const newSet: WorkoutSet = {
      id: genId(),
      weight: last?.weight ?? 0,
      reps: last?.reps ?? 0,
      completed: false,
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const updateSet = (idx: number, updates: Partial<WorkoutSet>) => {
    const sets = exercise.sets.map((s, i) => i === idx ? { ...s, ...updates } : s);
    onUpdate({ ...exercise, sets });
  };

  const deleteSet = (idx: number) => {
    const sets = exercise.sets.filter((_, i) => i !== idx);
    onUpdate({ ...exercise, sets });
  };

  const card: CSSProperties = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.card,
    padding: spacing.cardPad,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  };

  return (
    <div style={card}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{exercise.exerciseName}</div>
          <span style={{
            display: 'inline-block',
            marginTop: 4,
            background: `${bpColor}22`,
            border: `1px solid ${bpColor}66`,
            color: bpColor,
            fontSize: 10,
            fontWeight: 700,
            borderRadius: radii.badge,
            padding: '1px 6px',
          }}>
            {exercise.bodyPart}
          </span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          style={{
            background: 'none',
            border: 'none',
            color: colors.muted,
            fontSize: 18,
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Pro suggestion */}
      {proSuggestion && (
        <div style={{
          background: `${colors.accent}11`,
          border: `1px solid ${colors.accent}44`,
          borderRadius: radii.button,
          padding: '7px 10px',
          fontSize: 11,
          color: colors.accent,
        }}>
          💡 Pro 建議：{proSuggestion}
        </div>
      )}

      {/* Set table header */}
      {exercise.sets.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 1fr 32px',
          gap: 6,
        }}>
          <div style={{ fontSize: 10, color: colors.muted, textAlign: 'center' }}>組</div>
          <div style={{ fontSize: 10, color: colors.muted, textAlign: 'center' }}>重量(kg)</div>
          <div style={{ fontSize: 10, color: colors.muted, textAlign: 'center' }}>次數</div>
          <div />
        </div>
      )}

      {/* Sets */}
      {exercise.sets.map((set, i) => (
        <SetRow
          key={set.id}
          set={set}
          index={i}
          onChange={updates => updateSet(i, updates)}
          onDelete={() => deleteSet(i)}
        />
      ))}

      {/* Add set */}
      <button
        type="button"
        onClick={addSet}
        style={{
          background: colors.card2,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.button,
          color: colors.accent,
          fontSize: 13,
          fontWeight: 700,
          padding: '8px',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        ＋ 加組
      </button>
    </div>
  );
}
