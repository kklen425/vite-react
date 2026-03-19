import type { CSSProperties } from 'react';
import { colors, radii, spacing } from '../theme/tokens';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  valueColor?: string;
}

export function StatCard({ label, value, unit, valueColor = colors.accent }: StatCardProps) {
  const card: CSSProperties = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.card,
    padding: `${spacing.cardPad}px 12px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  };

  return (
    <div style={card}>
      <div style={{ fontSize: 22, fontWeight: 800, color: valueColor, lineHeight: 1.1 }}>
        {value}
        {unit && <span style={{ fontSize: 12, color: colors.muted, marginLeft: 2, fontWeight: 600 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 10, color: colors.muted, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>
        {label}
      </div>
    </div>
  );
}
