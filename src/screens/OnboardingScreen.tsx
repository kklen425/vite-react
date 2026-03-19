import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, radii } from '../theme/tokens';
import { accentBtnStyle, screenContainer } from '../theme/styles';
import { useApp } from '../context/AppContext';

type Goal = 'muscle' | 'fat' | 'fitness';
type Experience = 'beginner' | 'intermediate' | 'advanced';

const GOALS: { key: Goal; icon: string; label: string; sub: string }[] = [
  { key: 'muscle',   icon: '💪', label: '增肌',   sub: '增加肌肉量同力量' },
  { key: 'fat',     icon: '🔥', label: '減脂',   sub: '燃燒脂肪，塑造體型' },
  { key: 'fitness', icon: '⚡', label: '健體',   sub: '保持健康，提升體能' },
];

const FREQS = [3, 4, 5, 6];

const EXPERIENCES: { key: Experience; icon: string; label: string; tag: string }[] = [
  { key: 'beginner',     icon: '🌱', label: '新手',   tag: '+2.5kg/週' },
  { key: 'intermediate', icon: '🔥', label: '中級',   tag: '+1.25kg/週' },
  { key: 'advanced',     icon: '⚡', label: '高級',   tag: '+0.5kg/週' },
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const { prefs: { completeOnboarding } } = useApp();

  const [page, setPage] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [freq, setFreq] = useState<number | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);

  const finish = () => {
    completeOnboarding(goal, freq ?? 4, experience);
    navigate('/paywall');
  };

  const progressBar = (
    <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          flex: 1,
          height: 3,
          borderRadius: 2,
          background: i <= page ? colors.accent : colors.border,
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );

  const stepLabel = (
    <div style={{ fontSize: 11, color: colors.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>
      第 {page + 1} 步 / 3
    </div>
  );

  const wrap: CSSProperties = {
    ...screenContainer,
    padding: '40px 24px 100px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100dvh',
    paddingBottom: 0,
  };

  // Page 0: Goal
  if (page === 0) return (
    <div style={wrap}>
      {progressBar}
      {stepLabel}
      <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, marginBottom: 8 }}>你嘅訓練目標係？</div>
      <div style={{ fontSize: 12, color: colors.muted, marginBottom: 28 }}>我哋會根據你嘅目標提供個人化建議</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {GOALS.map(g => {
          const selected = goal === g.key;
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => setGoal(g.key)}
              style={{
                background: selected ? `${colors.accent}11` : colors.card,
                border: `1.5px solid ${selected ? colors.accent : colors.border}`,
                borderRadius: radii.card,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 24 }}>{g.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: selected ? colors.accent : colors.text }}>{g.label}</div>
                <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{g.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ padding: '24px 0' }}>
        <button style={{ ...accentBtnStyle, opacity: goal ? 1 : 0.4 }} onClick={() => goal && setPage(1)}>繼續</button>
      </div>
    </div>
  );

  // Page 1: Frequency
  if (page === 1) return (
    <div style={wrap}>
      {progressBar}
      {stepLabel}
      <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, marginBottom: 28 }}>每週打算練幾多日？</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        {FREQS.map(f => {
          const selected = freq === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFreq(f)}
              style={{
                background: selected ? `${colors.accent}11` : colors.card,
                border: `1.5px solid ${selected ? colors.accent : colors.border}`,
                borderRadius: radii.card,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 16px',
                cursor: 'pointer',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 800, color: selected ? colors.accent : colors.text }}>{f}</span>
              <span style={{ fontSize: 12, color: colors.muted }}>日 / 週</span>
            </button>
          );
        })}
      </div>
      <div style={{ padding: '24px 0' }}>
        <button style={{ ...accentBtnStyle, opacity: freq ? 1 : 0.4 }} onClick={() => freq && setPage(2)}>繼續</button>
      </div>
    </div>
  );

  // Page 2: Experience
  return (
    <div style={wrap}>
      {progressBar}
      {stepLabel}
      <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, marginBottom: 28 }}>訓練經驗？</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {EXPERIENCES.map(e => {
          const selected = experience === e.key;
          return (
            <button
              key={e.key}
              type="button"
              onClick={() => setExperience(e.key)}
              style={{
                background: selected ? `${colors.accent}11` : colors.card,
                border: `1.5px solid ${selected ? colors.accent : colors.border}`,
                borderRadius: radii.card,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>{e.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: selected ? colors.accent : colors.text }}>{e.label}</span>
              </div>
              <span style={{
                background: selected ? `${colors.accent}22` : colors.card2,
                border: `1px solid ${selected ? colors.accent : colors.border}`,
                color: selected ? colors.accent : colors.muted,
                borderRadius: radii.badge,
                padding: '3px 8px',
                fontSize: 11,
                fontWeight: 700,
              }}>{e.tag}</span>
            </button>
          );
        })}
      </div>
      <div style={{ padding: '24px 0' }}>
        <button style={{ ...accentBtnStyle, opacity: experience ? 1 : 0.4 }} onClick={() => experience && finish()}>完成設定</button>
      </div>
    </div>
  );
}
