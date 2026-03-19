import { useNavigate, useParams } from 'react-router-dom';
import { colors, radii, bodyPartColors, spacing } from '../theme/tokens';
import { screenContainer, screenPad } from '../theme/styles';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { PRBadge } from '../components/PRBadge';
import { EmptyState } from '../components/EmptyState';
import { formatDateLong } from '../utils/dates';

export function WorkoutDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workouts: { getWorkout, deleteWorkout, prs } } = useApp();

  const workout = id ? getWorkout(id) : undefined;

  if (!workout) {
    return (
      <div style={screenContainer}>
        <EmptyState icon="❓" title="找不到訓練紀錄" ctaLabel="返回紀錄" onCta={() => navigate('/history')} />
      </div>
    );
  }

  const totalSets = workout.exercises.reduce((s, e) => s + e.sets.length, 0);
  const totalVolume = workout.exercises.reduce(
    (s, e) => s + e.sets.reduce((ss, set) => ss + set.weight * set.reps, 0),
    0
  );
  const bodyParts = [...new Set(workout.exercises.map(e => e.bodyPart))];
  const prNames = new Set(prs.map(p => p.exerciseName));

  const handleDelete = () => {
    if (confirm('確定刪除此次訓練？')) {
      deleteWorkout(workout.id);
      navigate('/history');
    }
  };

  return (
    <div style={screenContainer}>
      <div style={screenPad}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: colors.accent, fontSize: 18, cursor: 'pointer', padding: 0 }}
          >
            ←
          </button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: colors.text }}>
              {formatDateLong(workout.date)}
            </div>
            <div style={{ fontSize: 11, color: colors.muted }}>{bodyParts.join(' · ')}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <StatCard label="動作" value={workout.exercises.length} />
          <StatCard label="組數" value={totalSets} />
          <StatCard label="總量" value={totalVolume.toFixed(0)} unit="kg" />
        </div>

        {/* Exercises */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.gap }}>
          {workout.exercises.map(ex => {
            const bpColor = bodyPartColors[ex.bodyPart] ?? colors.muted;
            const isPRExercise = prNames.has(ex.exerciseName);
            return (
              <div
                key={ex.id}
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.card,
                  padding: spacing.cardPad,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{ex.exerciseName}</div>
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
                      {ex.bodyPart}
                    </span>
                  </div>
                  {isPRExercise && <PRBadge />}
                </div>

                {/* Set rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {ex.sets.map((set, i) => {
                    const vol = set.weight * set.reps;
                    const prForEx = prs.find(p => p.exerciseName === ex.exerciseName);
                    const isSetPR = prForEx && (set.weight >= prForEx.weight || vol >= prForEx.volume);
                    return (
                      <div
                        key={set.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '4px 0',
                        }}
                      >
                        <span style={{ fontSize: 12, color: colors.muted, width: 28 }}>組{i + 1}</span>
                        <span style={{ fontSize: 13, color: colors.text, flex: 1 }}>
                          {set.weight}kg × {set.reps}
                        </span>
                        {isSetPR && i === 0 && <PRBadge />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          style={{
            background: '#2a0a0a',
            border: '1px solid #4a1a1a',
            borderRadius: radii.button,
            color: colors.red,
            fontSize: 14,
            fontWeight: 700,
            padding: '12px',
            cursor: 'pointer',
            width: '100%',
            marginTop: 24,
          }}
        >
          🗑 刪除此次訓練
        </button>
      </div>
    </div>
  );
}
