import type { CSSProperties } from 'react';

interface RestTimerProps {
  seconds: number;
  running: boolean;
  onAddTime: (extra: number) => void;
  onStop: () => void;
}

export function RestTimer({ seconds, running, onAddTime, onStop }: RestTimerProps) {
  if (!running) return null;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;

  const bar: CSSProperties = {
    position: 'fixed',
    bottom: 64,
    left: 0,
    right: 0,
    zIndex: 200,
    display: 'flex',
    justifyContent: 'center',
  };

  const inner: CSSProperties = {
    background: '#0a1a0a',
    border: '1px solid #1a4a1a',
    borderRadius: 14,
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    maxWidth: 340,
    width: '90%',
    animation: 'slideUp 0.2s ease',
  };

  return (
    <div style={bar}>
      <div style={inner}>
        <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700 }}>⏱ 組間休息</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#4ade80', flex: 1, textAlign: 'center' }}>
          {timeStr}
        </div>
        <button
          type="button"
          onClick={() => onAddTime(30)}
          style={{
            background: '#1a4a1a',
            border: '1px solid #2a6a2a',
            borderRadius: 8,
            color: '#4ade80',
            fontSize: 12,
            fontWeight: 700,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          +30s
        </button>
        <button
          type="button"
          onClick={onStop}
          style={{
            background: '#4a1a1a',
            border: '1px solid #6a2a2a',
            borderRadius: 8,
            color: '#FF4444',
            fontSize: 12,
            fontWeight: 700,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          停止
        </button>
      </div>
    </div>
  );
}
