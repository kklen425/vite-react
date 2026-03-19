import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, spacing } from '../theme/tokens';
import { screenContainer, screenPad } from '../theme/styles';
import { useApp } from '../context/AppContext';
import { WorkoutCard } from '../components/WorkoutCard';
import { BodyPartChip } from '../components/BodyPartChip';
import { EmptyState } from '../components/EmptyState';
import { BODY_PART_ORDER } from '../constants/exercises';

export function HistoryScreen() {
  const navigate = useNavigate();
  const { workouts: { workouts, prs, loaded } } = useApp();
  const [filterPart, setFilterPart] = useState<string | null>(null);

  const filtered = useMemo(() =>
    filterPart
      ? workouts.filter(w => w.exercises.some(e => e.bodyPart === filterPart))
      : workouts,
    [workouts, filterPart]
  );

  const prNames = prs.map(p => p.exerciseName);

  if (!loaded) {
    return (
      <div style={{ ...screenContainer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: colors.muted, fontSize: 14 }}>載入中…</div>
      </div>
    );
  }

  return (
    <div style={screenContainer}>
      <div style={screenPad}>
        <div style={{ fontSize: 18, fontWeight: 800, color: colors.text, marginBottom: 16 }}>訓練紀錄</div>

        {/* Body part filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          <BodyPartChip bodyPart="全部" selected={!filterPart} onClick={() => setFilterPart(null)} />
          {BODY_PART_ORDER.map(bp => (
            <BodyPartChip
              key={bp}
              bodyPart={bp}
              selected={filterPart === bp}
              onClick={() => setFilterPart(filterPart === bp ? null : bp)}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="未有訓練紀錄"
            subtitle="立即開始第一次訓練！"
            ctaLabel="開始訓練"
            onCta={() => navigate('/workout/new')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.gap }}>
            {filtered.map(w => (
              <WorkoutCard
                key={w.id}
                workout={w}
                prs={prNames}
                onClick={() => navigate(`/workout/${w.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
