import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, radii, spacing } from '../theme/tokens';
import { accentBtnStyle, screenContainer } from '../theme/styles';
import { useApp } from '../context/AppContext';

const FEATURES = [
  '📊 所有動作進度圖表',
  '💡 智能加重建議',
  '📏 身體數據追蹤',
  '⏱ 自訂組間休息時間',
  '📤 匯出訓練數據 CSV',
  '🔔 個人化訓練提醒',
];

export function PaywallScreen() {
  const navigate = useNavigate();
  const { prefs: { updatePrefs } } = useApp();
  const subscribe = () => {
    updatePrefs({ isPro: true });
    navigate('/home');
  };

  const skip = () => navigate('/home');

  const wrap: CSSProperties = {
    ...screenContainer,
    padding: `${spacing.screenTop}px ${spacing.screenX}px 120px`,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  };

  const planCard = (highlight?: boolean): CSSProperties => ({
    background: highlight ? `${colors.accent}11` : colors.card,
    border: `1.5px solid ${highlight ? colors.accent : colors.border}`,
    borderRadius: radii.card,
    padding: '14px 16px',
    cursor: 'pointer',
    position: 'relative',
  });

  return (
    <div style={wrap}>
      <div style={{ textAlign: 'center', paddingTop: 32, marginBottom: 24 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 6 }}>升級至 Pro</div>
        <div style={{ fontSize: 12, color: colors.muted }}>解鎖全部功能，全力突破極限</div>
      </div>

      {/* Features */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.card,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginBottom: 16,
      }}>
        {FEATURES.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: colors.accent, fontWeight: 800, fontSize: 14 }}>✓</span>
            <span style={{ fontSize: 13, color: colors.text }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Yearly plan */}
      <div style={{ ...planCard(true), marginBottom: 10 }}>
        <div style={{
          position: 'absolute',
          top: -10,
          right: 14,
          background: colors.accent,
          color: '#000',
          fontSize: 10,
          fontWeight: 800,
          borderRadius: radii.badge,
          padding: '3px 8px',
        }}>
          最受歡迎
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: colors.text }}>年費計劃</div>
            <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>= HK$19/月 · 7 日免費試用</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: colors.accent }}>HK$228</div>
            <div style={{ fontSize: 10, color: colors.muted }}>/年</div>
          </div>
        </div>
      </div>

      {/* Monthly plan */}
      <div style={{ ...planCard(false), marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>月費計劃</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>HK$38</div>
            <div style={{ fontSize: 10, color: colors.muted }}>/月</div>
          </div>
        </div>
      </div>

      <button style={accentBtnStyle} onClick={subscribe}>開始 7 日免費試用</button>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: colors.muted }}>
        還原購買 · 私隱政策 · 條款
      </div>
      <div style={{ textAlign: 'center', marginTop: 6, fontSize: 10, color: '#333' }}>
        隨時可取消，唔會有額外收費
      </div>

      <button
        onClick={skip}
        style={{
          background: 'none',
          border: 'none',
          color: '#444',
          fontSize: 12,
          cursor: 'pointer',
          marginTop: 12,
          padding: 8,
          textAlign: 'center',
          width: '100%',
        }}
      >
        暫時略過
      </button>
    </div>
  );
}
