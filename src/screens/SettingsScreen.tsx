import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, radii } from '../theme/tokens';
import { screenContainer, screenPad } from '../theme/styles';
import { useApp } from '../context/AppContext';

const REST_OPTIONS = [30, 60, 90, 120, 180];

export function SettingsScreen() {
  const navigate = useNavigate();
  const { prefs: { prefs, updatePrefs, togglePro } } = useApp();

  const section: CSSProperties = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.card,
    overflow: 'hidden',
    marginBottom: 16,
  };

  const row: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: `1px solid ${colors.border}`,
  };

  const lastRow: CSSProperties = {
    ...row,
    borderBottom: 'none',
  };

  const label: CSSProperties = {
    fontSize: 13,
    color: colors.text,
    fontWeight: 500,
  };

  const muted: CSSProperties = {
    fontSize: 12,
    color: colors.muted,
  };

  const sectionTitle: CSSProperties = {
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: 700,
    marginBottom: 8,
  };

  return (
    <div style={screenContainer}>
      <div style={screenPad}>
        <div style={{ fontSize: 18, fontWeight: 800, color: colors.text, marginBottom: 20 }}>設定</div>

        {/* Training settings */}
        <div style={sectionTitle}>訓練設定</div>
        <div style={section}>
          <div style={row}>
            <span style={label}>預設休息時間</span>
            <select
              value={prefs.restTimerSeconds}
              onChange={e => updatePrefs({ restTimerSeconds: parseInt(e.target.value) })}
              style={{
                background: colors.card2,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.badge,
                color: prefs.isPro ? colors.text : colors.muted,
                fontSize: 12,
                padding: '4px 8px',
                cursor: prefs.isPro ? 'pointer' : 'not-allowed',
                outline: 'none',
              }}
              disabled={!prefs.isPro}
            >
              {REST_OPTIONS.map(s => (
                <option key={s} value={s}>{s} 秒</option>
              ))}
            </select>
          </div>
          <div style={lastRow}>
            <span style={label}>目標次數範圍</span>
            <span style={muted}>8–12</span>
          </div>
        </div>

        {/* Notifications */}
        <div style={sectionTitle}>通知</div>
        <div style={section}>
          <div style={row}>
            <span style={label}>訓練提醒</span>
            <div style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: colors.border,
              position: 'relative',
              cursor: 'pointer',
            }}>
              <div style={{
                position: 'absolute',
                top: 2,
                left: 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: colors.muted,
              }} />
            </div>
          </div>
          <div style={lastRow}>
            <span style={label}>Streak 提醒</span>
            <div style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: colors.border,
              position: 'relative',
              cursor: 'pointer',
            }}>
              <div style={{
                position: 'absolute',
                top: 2,
                left: 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: colors.muted,
              }} />
            </div>
          </div>
        </div>

        {/* Account */}
        <div style={sectionTitle}>帳號 & 訂閱</div>
        <div style={section}>
          <div style={row}>
            <span style={label}>訂閱狀態</span>
            {prefs.isPro ? (
              <span style={{ fontSize: 12, fontWeight: 700, color: colors.accent }}>Pro ✓</span>
            ) : (
              <button
                onClick={() => navigate('/paywall')}
                style={{
                  background: `${colors.accent}22`,
                  border: `1px solid ${colors.accent}66`,
                  borderRadius: radii.badge,
                  color: colors.accent,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                升級 Pro
              </button>
            )}
          </div>
          <div style={row}>
            <span style={label}>管理訂閱</span>
            <span style={muted}>›</span>
          </div>
          <div style={lastRow}>
            <span style={label}>還原購買</span>
            <span style={muted}>›</span>
          </div>
        </div>

        {/* About */}
        <div style={sectionTitle}>關於</div>
        <div style={section}>
          <div style={row}>
            <span style={label}>私隱政策</span>
            <span style={muted}>›</span>
          </div>
          <div style={row}>
            <span style={label}>使用條款</span>
            <span style={muted}>›</span>
          </div>
          <div style={lastRow}>
            <span style={label}>版本</span>
            <span style={muted}>1.0.0</span>
          </div>
        </div>

        {/* Dev toggle */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={togglePro}
            style={{
              background: 'none',
              border: `1px solid ${colors.border}`,
              borderRadius: radii.pill,
              color: colors.muted,
              fontSize: 11,
              padding: '6px 16px',
              cursor: 'pointer',
            }}
          >
            {prefs.isPro ? '切換至免費版（測試）' : '切換至 Pro（測試）'}
          </button>
        </div>
      </div>
    </div>
  );
}
