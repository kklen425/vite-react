import type { CSSProperties, ReactNode } from 'react';
import { colors, radii } from '../theme/tokens';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  const backdrop: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    animation: 'fadeIn 0.15s ease',
  };

  const sheet: CSSProperties = {
    background: colors.card,
    borderRadius: `${radii.card}px ${radii.card}px 0 0`,
    maxHeight: '90dvh',
    overflowY: 'auto',
    animation: 'slideUp 0.2s ease',
    maxWidth: 520,
    width: '100%',
    margin: '0 auto',
  };

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={sheet} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
