import type { CSSProperties } from 'react';
import type { WorkoutSet } from '../types';
import { colors, radii } from '../theme/tokens';

interface SetRowProps {
  set: WorkoutSet;
  index: number;
  onChange: (updates: Partial<WorkoutSet>) => void;
  onDelete: () => void;
}

export function SetRow({ set, index, onChange, onDelete }: SetRowProps) {
  const input: CSSProperties = {
    background: colors.card2,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.button,
    color: colors.text,
    fontSize: 15,
    fontWeight: 700,
    padding: '8px 4px',
    textAlign: 'center',
    outline: 'none',
    width: '100%',
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '32px 1fr 1fr 32px',
      alignItems: 'center',
      gap: 6,
      padding: '4px 0',
    }}>
      <div style={{ fontSize: 12, color: colors.muted, textAlign: 'center', fontWeight: 700 }}>
        {index + 1}
      </div>
      <input
        type="number"
        style={input}
        value={set.weight || ''}
        min={0}
        max={999.5}
        step={0.5}
        placeholder="0"
        onChange={e => onChange({ weight: parseFloat(e.target.value) || 0 })}
      />
      <input
        type="number"
        style={input}
        value={set.reps || ''}
        min={1}
        max={999}
        placeholder="0"
        onChange={e => onChange({ reps: parseInt(e.target.value) || 0 })}
      />
      <button
        type="button"
        onClick={onDelete}
        style={{
          background: 'none',
          border: 'none',
          color: colors.muted,
          fontSize: 14,
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>
    </div>
  );
}
