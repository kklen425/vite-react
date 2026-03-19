import type { CSSProperties, ReactNode } from 'react';
import { colors, radii, spacing } from '../theme/tokens';

interface ChartCardProps {
  title: string;
  value?: string | number;
  unit?: string;
  children: ReactNode;
}

export function ChartCard({ title, value, unit, children }: ChartCardProps) {
  const card: CSSProperties = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.card,
    padding: spacing.cardPad,
    overflow: 'hidden',
  };

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{title}</div>
        {value !== undefined && (
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.accent }}>
            {value}
            {unit && <span style={{ fontSize: 11, color: colors.muted, marginLeft: 2 }}>{unit}</span>}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
