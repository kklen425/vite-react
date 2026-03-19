import type { CSSProperties } from 'react';
import { colors, radii, spacing } from './tokens';

export const cardStyle: CSSProperties = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.card,
  padding: spacing.cardPad,
};

export const card2Style: CSSProperties = {
  background: colors.card2,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.card,
  padding: spacing.cardPad,
};

export const inputStyle: CSSProperties = {
  background: colors.card2,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.button,
  color: colors.text,
  fontSize: 14,
  padding: '10px 12px',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: "'Noto Sans TC', sans-serif",
};

export const accentBtnStyle: CSSProperties = {
  background: colors.accent,
  color: '#000',
  border: 'none',
  borderRadius: radii.button,
  fontSize: 15,
  fontWeight: 800,
  padding: '14px 20px',
  width: '100%',
  cursor: 'pointer',
  fontFamily: "'Noto Sans TC', sans-serif",
};

export const ghostBtnStyle: CSSProperties = {
  background: colors.card2,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.button,
  fontSize: 14,
  fontWeight: 600,
  padding: '10px 16px',
  cursor: 'pointer',
  fontFamily: "'Noto Sans TC', sans-serif",
};

export const sectionLabel: CSSProperties = {
  fontSize: 10,
  color: colors.muted,
  letterSpacing: 2,
  textTransform: 'uppercase',
  fontWeight: 700,
};

export const screenContainer: CSSProperties = {
  background: colors.bg,
  minHeight: '100dvh',
  paddingBottom: 80,
  fontFamily: "'Noto Sans TC', -apple-system, sans-serif",
  color: colors.text,
  maxWidth: 520,
  margin: '0 auto',
  position: 'relative',
  overflowX: 'hidden',
};

export const screenPad: CSSProperties = {
  padding: `${spacing.screenTop}px ${spacing.screenX}px`,
};
