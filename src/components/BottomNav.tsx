import type { CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { colors } from '../theme/tokens';
import { NAV_TABS } from '../constants/navigation';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const nav: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    background: '#0a0a0a',
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 100,
    maxWidth: 520,
    margin: '0 auto',
  };

  // Fix: make sure the nav sticks to bottom on all screen widths
  const outer: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  };

  return (
    <div style={outer}>
      <div style={nav}>
        {NAV_TABS.map(tab => {
          const active = location.pathname === tab.path ||
            (tab.path === '/workout/new' && location.pathname.startsWith('/workout'));
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '6px 12px',
                color: active ? colors.accent : colors.muted,
                transition: 'color 0.15s',
              }}
            >
              <span style={{ fontSize: tab.key === 'workout' ? 22 : 18, lineHeight: 1 }}>
                {tab.icon}
              </span>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, letterSpacing: 0.5 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
