import type { CSSProperties } from 'react';
import { bodyPartColors } from '../theme/tokens';
import { colors, radii } from '../theme/tokens';

interface BodyPartChipProps {
  bodyPart: string;
  selected?: boolean;
  onClick?: () => void;
  small?: boolean;
}

export function BodyPartChip({ bodyPart, selected, onClick, small }: BodyPartChipProps) {
  const bpColor = bodyPartColors[bodyPart] ?? colors.muted;

  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: small ? '3px 8px' : '7px 14px',
    borderRadius: radii.pill,
    fontSize: small ? 10 : 13,
    fontWeight: 700,
    cursor: onClick ? 'pointer' : 'default',
    border: `1px solid ${selected ? bpColor : colors.border}`,
    background: selected ? `${bpColor}22` : colors.card2,
    color: selected ? bpColor : colors.muted,
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  };

  return (
    <button style={style} onClick={onClick} type="button">
      {bodyPart}
    </button>
  );
}
