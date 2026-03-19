import type { CSSProperties } from 'react';
import { colors } from '../theme/tokens';

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  const style: CSSProperties = {
    position: 'fixed',
    bottom: 90,
    left: '50%',
    transform: 'translateX(-50%)',
    background: colors.card2,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    padding: '10px 20px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    zIndex: 9999,
    whiteSpace: 'nowrap',
    animation: 'slideUp 0.2s ease',
    boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
  };

  return <div style={style}>{message}</div>;
}
