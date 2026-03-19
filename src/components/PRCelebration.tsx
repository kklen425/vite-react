import { useEffect, useState, type CSSProperties } from 'react';
import { colors } from '../theme/tokens';
import { accentBtnStyle } from '../theme/styles';

interface PRCelebrationProps {
  exerciseName: string;
  onClose: () => void;
}

const CONFETTI_COLORS = [colors.accent, colors.orange, colors.blue, colors.red, '#ffffff'];

export function PRCelebration({ exerciseName, onClose }: PRCelebrationProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); onClose(); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onClose]);

  const backdrop: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.2s ease',
  };

  const content: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    textAlign: 'center',
    padding: '0 32px',
    animation: 'scaleIn 0.3s ease',
    position: 'relative',
    zIndex: 1,
  };

  return (
    <div style={backdrop}>
      {/* Confetti */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '35%',
            width: i % 2 === 0 ? 8 : 6,
            height: i % 2 === 0 ? 8 : 12,
            borderRadius: i % 3 === 0 ? '50%' : 2,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `confetti${i} 1.2s ease-out ${(i * 0.05).toFixed(2)}s both`,
            zIndex: 0,
          }}
        />
      ))}

      <div style={content}>
        <div style={{ fontSize: 60, lineHeight: 1 }}>🏆</div>
        <div style={{
          fontSize: 14,
          color: colors.accent,
          letterSpacing: 3,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}>
          新個人紀錄
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: colors.text }}>
          {exerciseName}
        </div>
        <button
          style={{ ...accentBtnStyle, width: 'auto', padding: '12px 32px', marginTop: 8 }}
          onClick={onClose}
        >
          繼續！
        </button>
        <div style={{ fontSize: 11, color: colors.muted }}>{countdown} 秒後自動關閉</div>
      </div>
    </div>
  );
}
