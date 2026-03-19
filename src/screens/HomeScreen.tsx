import { useNavigate } from 'react-router-dom';
import { colors, radii, spacing } from '../theme/tokens';
import { screenContainer, screenPad } from '../theme/styles';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { WorkoutCard } from '../components/WorkoutCard';
import { EmptyState } from '../components/EmptyState';
import { greeting, relativeDateLabel } from '../utils/dates';

export function HomeScreen() {
  const navigate = useNavigate();
  const { workouts: { stats, recentWorkouts, prs, loaded } } = useApp();

  if (!loaded) {
    return (
      <div style={{ ...screenContainer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: colors.muted, fontSize: 14, animation: 'pulse 1.5s infinite' }}>載入中…</div>
      </div>
    );
  }

  const lastWorkout = recentWorkouts[0];
  const lastParts = lastWorkout
    ? [...new Set(lastWorkout.exercises.map(e => e.bodyPart))].join(' · ')
    : '';
  const lastWhen = lastWorkout ? relativeDateLabel(lastWorkout.date) : '';

  const prList = prs.slice(0, 5);

  return (
    <div style={screenContainer}>
      <div style={screenPad}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>{greeting()}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>準備好訓練？</div>
          </div>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: `${colors.accent}22`,
            border: `2px solid ${colors.accent}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 800,
            color: colors.accent,
          }}>
            U
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <StatCard label="本週訓練" value={stats.weeklyCount} unit="次" />
          <StatCard label="本月訓練" value={stats.monthlyCount} unit="次" />
          <StatCard label="連續天數" value={stats.streak} unit="天" valueColor={colors.orange} />
        </div>

        {/* CTA Banner */}
        <div
          onClick={() => navigate('/workout/new')}
          style={{
            background: colors.accent,
            borderRadius: radii.card,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#000' }}>開始今日訓練</div>
            {lastWorkout && (
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.6)', marginTop: 2 }}>
                上次：{lastParts} · {lastWhen}
              </div>
            )}
          </div>
          <div style={{ fontSize: 28 }}>💪</div>
        </div>

        {/* Recent workouts */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>最近訓練</div>
            {recentWorkouts.length > 0 && (
              <button
                onClick={() => navigate('/history')}
                style={{ background: 'none', border: 'none', color: colors.accent, fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
              >
                全部 →
              </button>
            )}
          </div>

          {recentWorkouts.length === 0 ? (
            <EmptyState
              icon="🏋️"
              title="未有訓練紀錄"
              subtitle="立即開始第一次訓練！"
              ctaLabel="開始訓練"
              onCta={() => navigate('/workout/new')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.gap }}>
              {recentWorkouts.map(w => (
                <WorkoutCard
                  key={w.id}
                  workout={w}
                  prs={prs.map(p => p.exerciseName)}
                  onClick={() => navigate(`/workout/${w.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* PR section */}
        {prList.length > 0 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 12 }}>
              最新 PR 🏆
            </div>
            <div style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.card,
              overflow: 'hidden',
            }}>
              {prList.map((pr, i) => (
                <div
                  key={pr.exerciseName}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: i < prList.length - 1 ? `1px solid ${colors.border}` : 'none',
                  }}
                >
                  <div style={{ fontSize: 13, color: colors.text }}>{pr.exerciseName}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.accent }}>
                    {pr.weight}kg × {Math.round(pr.volume / pr.weight)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
