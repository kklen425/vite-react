import type { CSSProperties } from 'react';
import { colors, radii } from '../theme/tokens';

export function PRBadge() {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    background: `${colors.accent}22`,
    border: `1px solid ${colors.accent}88`,
    borderRadius: radii.badge,
    padding: '2px 6px',
    fontSize: 10,
    fontWeight: 800,
    color: colors.accent,
    letterSpacing: 0.5,
  };
  return <span style={style}>🏆 PR</span>;
}
