import type { CSSProperties } from 'react';
import type { Workout } from '../types';
import { colors, radii, spacing } from '../theme/tokens';
import { bodyPartColors } from '../theme/tokens';
import { formatDateLong } from '../utils/dates';

interface WorkoutCardProps {
  workout: Workout;
  prs?: string[];
  onClick?: () => void;
}

export function WorkoutCard({ workout, prs = [], onClick }: WorkoutCardProps) {
  const totalSets = workout.exercises.reduce((s, e) => s + e.sets.length, 0);
  const totalVolume = workout.exercises.reduce(
    (s, e) => s + e.sets.reduce((ss, set) => ss + set.weight * set.reps, 0),
    0
  );
  const bodyParts = [...new Set(workout.exercises.map(e => e.bodyPart))];
  const hasPR = workout.exercises.some(e =>
    prs.some(p => p === e.exerciseName)
  );

  const card: CSSProperties = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.card,
    padding: spacing.cardPad,
    cursor: onClick ? 'pointer' : 'default',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    animation: 'fadeIn 0.2s ease',
  };

  return (
    <div style={card} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {bodyParts.map(bp => {
            const bpColor = bodyPartColors[bp] ?? colors.muted;
            return (
              <span
                key={bp}
                style={{
                  background: `${bpColor}22`,
                  border: `1px solid ${bpColor}66`,
                  color: bpColor,
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: radii.badge,
                  padding: '2px 7px',
                }}
              >
                {bp}
              </span>
            );
          })}
          {hasPR && (
            <span style={{
              background: `${colors.accent}22`,
              border: `1px solid ${colors.accent}88`,
              color: colors.accent,
              fontSize: 10,
              fontWeight: 800,
              borderRadius: radii.badge,
              padding: '2px 7px',
            }}>
              🏆 PR
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: colors.muted }}>{formatDateLong(workout.date)}</div>
      </div>
      <div style={{ fontSize: 11, color: colors.muted }}>
        {workout.exercises.length} 個動作 · {totalSets} 組 · 總量 {totalVolume.toFixed(0)}kg
      </div>
    </div>
  );
}
