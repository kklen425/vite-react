import { useState, type CSSProperties } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { colors, radii } from '../theme/tokens';
import { accentBtnStyle } from '../theme/styles';
import { useApp } from '../context/AppContext';
import { ChartCard } from '../components/ChartCard';
import { EmptyState } from '../components/EmptyState';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { formatDate, todayISO } from '../utils/dates';

interface BodyScreenProps {
  embedded?: boolean;
}

export function BodyScreen({ embedded }: BodyScreenProps) {
  const { metrics: { metrics, addMetric } } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ weight: '', bodyFat: '', waist: '', date: todayISO() });

  const latest = metrics[0];
  const prev = metrics[1];

  const weightDelta = latest?.weight && prev?.weight
    ? (latest.weight - prev.weight).toFixed(1)
    : null;

  const chartData = metrics
    .slice()
    .reverse()
    .filter(m => m.weight)
    .map(m => ({ date: m.date, weight: m.weight }));

  const handleSave = () => {
    addMetric({
      weight: form.weight ? parseFloat(form.weight) : undefined,
      bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
      waist: form.waist ? parseFloat(form.waist) : undefined,
      date: form.date,
    });
    setForm({ weight: '', bodyFat: '', waist: '', date: todayISO() });
    setModalOpen(false);
  };

  const inputStyle: CSSProperties = {
    background: colors.card2,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.button,
    color: colors.text,
    fontSize: 14,
    padding: '10px 12px',
    width: '100%',
    outline: 'none',
  };

  return (
    <div style={embedded ? {} : { paddingTop: 16 }}>
      {!embedded && (
        <div style={{ fontSize: 18, fontWeight: 800, color: colors.text, marginBottom: 16 }}>身體數據</div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <StatCard label="現時體重" value={latest?.weight?.toFixed(1) ?? '--'} unit="kg" />
        <StatCard
          label="本月變化"
          value={weightDelta ? (parseFloat(weightDelta) < 0 ? weightDelta : `+${weightDelta}`) : '--'}
          unit="kg"
          valueColor={weightDelta && parseFloat(weightDelta) < 0 ? '#4ade80' : colors.accent}
        />
        <StatCard label="體脂率" value={latest?.bodyFat?.toFixed(1) ?? '--'} unit="%" />
      </div>

      {/* Weight chart */}
      {chartData.length >= 2 && (
        <div style={{ marginBottom: 16 }}>
          <ChartCard title="體重趨勢" value={latest?.weight?.toFixed(1)} unit="kg">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 8, fill: colors.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 8, fill: colors.muted }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: colors.card2, border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.text, fontSize: 11 }}
                  formatter={(v) => [`${v}kg`, '體重']}
                  labelFormatter={(l) => formatDate(String(l))}
                />
                <Line type="monotone" dataKey="weight" stroke={colors.blue} strokeWidth={2} dot={{ fill: colors.blue, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Add data CTA */}
      <button style={{ ...accentBtnStyle, marginBottom: 16 }} onClick={() => setModalOpen(true)}>
        記錄今日數據 ＋
      </button>

      {/* History list */}
      {metrics.length === 0 ? (
        <EmptyState icon="📏" title="未有身體數據" subtitle="記錄體重、體脂等數據追蹤進度" />
      ) : (
        <div style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.card,
          overflow: 'hidden',
        }}>
          {metrics.slice(0, 10).map((m, i) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: i < metrics.length - 1 ? `1px solid ${colors.border}` : 'none',
              }}
            >
              <div style={{ fontSize: 11, color: colors.muted }}>{m.date}</div>
              <div style={{ display: 'flex', gap: 16 }}>
                {m.weight && <span style={{ fontSize: 12, color: colors.text }}>{m.weight}kg</span>}
                {m.bodyFat && <span style={{ fontSize: 12, color: colors.muted }}>{m.bodyFat}%</span>}
                {m.waist && <span style={{ fontSize: 12, color: colors.muted }}>腰{m.waist}cm</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add data modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: colors.text, marginBottom: 16 }}>記錄今日數據</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>體重 (kg)</div>
              <input
                type="number"
                style={inputStyle}
                value={form.weight}
                onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                placeholder="70.0"
                step={0.1}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>體脂率 (%)</div>
              <input
                type="number"
                style={inputStyle}
                value={form.bodyFat}
                onChange={e => setForm(f => ({ ...f, bodyFat: e.target.value }))}
                placeholder="15.0"
                step={0.1}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>腰圍 (cm)</div>
              <input
                type="number"
                style={inputStyle}
                value={form.waist}
                onChange={e => setForm(f => ({ ...f, waist: e.target.value }))}
                placeholder="80"
              />
            </div>
            <button style={accentBtnStyle} onClick={handleSave}>儲存</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
