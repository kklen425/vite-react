import type { CSSProperties } from 'react';
import { colors, radii } from '../theme/tokens';
import { accentBtnStyle } from '../theme/styles';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon, title, subtitle, ctaLabel, onCta }: EmptyStateProps) {
  const wrap: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    textAlign: 'center',
    gap: 12,
  };

  return (
    <div style={wrap}>
      <div style={{ fontSize: 48 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: colors.muted }}>{subtitle}</div>}
      {ctaLabel && onCta && (
        <button
          style={{ ...accentBtnStyle, width: 'auto', padding: '12px 24px', borderRadius: radii.pill, marginTop: 8 }}
          onClick={onCta}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
