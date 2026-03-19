import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, radii } from '../theme/tokens';
import { accentBtnStyle } from '../theme/styles';

interface PaywallGateProps {
  locked: boolean;
  children: ReactNode;
}

export function PaywallGate({ locked, children }: PaywallGateProps) {
  const navigate = useNavigate();

  if (!locked) return <>{children}</>;

  const wrap: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radii.card,
  };

  const blurred: CSSProperties = {
    filter: 'blur(3px)',
    opacity: 0.4,
    pointerEvents: 'none',
    userSelect: 'none',
  };

  const overlay: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  };

  return (
    <div style={wrap}>
      <div style={blurred}>{children}</div>
      <div style={overlay}>
        <div style={{ fontSize: 32 }}>🔒</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>升級 Pro 解鎖</div>
        <button
          style={{ ...accentBtnStyle, width: 'auto', padding: '10px 24px', borderRadius: radii.pill }}
          onClick={() => navigate('/paywall')}
        >
          升級 Pro
        </button>
      </div>
    </div>
  );
}
