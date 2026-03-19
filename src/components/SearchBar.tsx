import type { CSSProperties } from 'react';
import { colors, radii } from '../theme/tokens';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = '搜尋…' }: SearchBarProps) {
  const wrap: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const input: CSSProperties = {
    background: colors.card2,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.pill,
    color: colors.text,
    fontSize: 14,
    padding: '10px 14px 10px 36px',
    width: '100%',
    outline: 'none',
  };

  const icon: CSSProperties = {
    position: 'absolute',
    left: 12,
    color: colors.muted,
    fontSize: 14,
    pointerEvents: 'none',
  };

  return (
    <div style={wrap}>
      <span style={icon}>🔍</span>
      <input
        style={input}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
