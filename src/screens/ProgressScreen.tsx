import { useState, useMemo, type CSSProperties } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { colors, radii } from '../theme/tokens';
import { screenContainer, screenPad } from '../theme/styles';
import { useApp } from '../context/AppContext';
import { ChartCard } from '../components/ChartCard';
import { PaywallGate } from '../components/PaywallGate';
import { EmptyState } from '../components/EmptyState';
import { BodyScreen } from './BodyScreen';
import { formatDate } from '../utils/dates';
import { useNavigate } from 'react-router-dom';

type Metric = 'weight' | 'volume';
type Range = '1m' | '3m' | 'all';

export function ProgressScreen() {
  const navigate = useNavigate();
  const { workouts: { allExerciseNames, getExerciseProgress }, prefs: { prefs } } = useApp();
  const [subTab, setSubTab] = useState<'progress' | 'body'>('progress');
  const [selectedEx, setSelectedEx] = useState('');
  const [metric, setMetric] = useState<Metric>('weight');
  const [range, setRange] = useState<Range>('all');

  const exerciseName = selectedEx || allExerciseNames[0] || '';
  const rawData = getExerciseProgress(exerciseName);

  const cutoffDays = range === '1m' ? 30 : range === '3m' ? 90 : Infinity;
  const now = new Date();

  const data = useMemo(() =>
    rawData.filter(d => {
      const diff = Math.floor((now.getTime() - new Date(d.date + 'T00:00:00').getTime()) / 86400000);
      return diff <= cutoffDays;
    }),
    [rawData, cutoffDays]
  );

  const currentVal = data.length > 0 ? data[data.length - 1][metric] : 0;
  const startVal = data.length > 0 ? data[0][metric] : 0;
  const delta = currentVal - startVal;

  const subTabStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    background: active ? colors.card : 'transparent',
    border: 'none',
    borderRadius: radii.button,
    color: active ? colors.text : colors.muted,
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    padding: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  if (subTab === 'body') return (
    <div style={screenContainer}>
      <div style={screenPad}>
        <div style={{ fontSize: 18, fontWeight: 800, color: colors.text, marginBottom: 16 }}>進度</div>
        <div style={{ display: 'flex', background: colors.card2, borderRadius: radii.button, padding: 4, marginBottom: 20 }}>
          <button style={subTabStyle(false)} onClick={() => setSubTab('progress')}>訓練進度</button>
          <button style={subTabStyle(true)}>身體數據</button>
        </div>
        <PaywallGate locked={!prefs.isPro}>
          <BodyScreen embedded />
        </PaywallGate>
      </div>
    </div>
  );

  return (
    <div style={screenContainer}>
      <div style={screenPad}>
        <div style={{ fontSize: 18, fontWeight: 800, color: colors.text, marginBottom: 16 }}>進度</div>

        {/* Sub-tab switcher */}
        <div style={{ display: 'flex', background: colors.card2, borderRadius: radii.button, padding: 4, marginBottom: 20 }}>
          <button style={subTabStyle(true)}>訓練進度</button>
          <button style={subTabStyle(false)} onClick={() => setSubTab('body')}>身體數據</button>
        </div>

        {allExerciseNames.length === 0 ? (
          <EmptyState
            icon="📊"
            title="未有訓練數據"
            subtitle="完成訓練後即可睇到進度圖表"
            ctaLabel="開始訓練"
            onCta={() => navigate('/workout/new')}
          />
        ) : (
          <>
            {/* Exercise selector */}
            <div style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.card,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{exerciseName || '選擇動作'}</div>
              <select
                value={exerciseName}
                onChange={e => setSelectedEx(e.target.value)}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  left: 0,
                  top: 0,
                  cursor: 'pointer',
                }}
              >
                {allExerciseNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span style={{ fontSize: 11, color: colors.accent }}>更改 →</span>
            </div>

            {/* Metric toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {(['weight', 'volume'] as Metric[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  style={{
                    background: metric === m ? `${colors.accent}22` : 'transparent',
                    border: `1px solid ${metric === m ? colors.accent : colors.border}`,
                    borderRadius: radii.pill,
                    color: metric === m ? colors.accent : colors.muted,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '6px 14px',
                    cursor: 'pointer',
                  }}
                >
                  {m === 'weight' ? '最高重量' : '總訓練量'}
                </button>
              ))}
            </div>

            {/* Time range */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['1m', '3m', 'all'] as Range[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  style={{
                    background: range === r ? `${colors.accent}22` : 'transparent',
                    border: `1px solid ${range === r ? colors.accent : colors.border}`,
                    borderRadius: radii.pill,
                    color: range === r ? colors.accent : colors.muted,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '6px 12px',
                    cursor: 'pointer',
                  }}
                >
                  {r === '1m' ? '1月' : r === '3m' ? '3月' : '全部'}
                </button>
              ))}
            </div>

            {/* Chart */}
            {data.length < 2 ? (
              <EmptyState icon="📈" title="數據不足" subtitle="需要至少 2 次訓練紀錄先可以睇圖表" />
            ) : (
              <ChartCard
                title={metric === 'weight' ? '最高重量趨勢' : '總訓練量趨勢'}
                value={currentVal.toFixed(metric === 'weight' ? 1 : 0)}
                unit={metric === 'weight' ? 'kg' : 'kg總量'}
              >
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      tick={{ fontSize: 8, fill: colors.muted }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 8, fill: colors.muted }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: colors.card2,
                        border: `1px solid ${colors.border}`,
                        borderRadius: radii.badge,
                        color: colors.text,
                        fontSize: 11,
                      }}
                      formatter={(v) => [Number(v).toFixed(1), metric === 'weight' ? 'kg' : '總量']}
                      labelFormatter={(l) => formatDate(String(l))}
                    />
                    <Line
                      type="monotone"
                      dataKey={metric}
                      stroke={colors.accent}
                      strokeWidth={2}
                      dot={{ fill: colors.accent, r: 3 }}
                      activeDot={{ r: 5, fill: colors.accent }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Stats summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12, borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: delta >= 0 ? colors.accent : colors.red }}>
                      {delta >= 0 ? '+' : ''}{delta.toFixed(1)}
                    </div>
                    <div style={{ fontSize: 9, color: colors.muted, marginTop: 2 }}>進步</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{startVal.toFixed(1)}</div>
                    <div style={{ fontSize: 9, color: colors.muted, marginTop: 2 }}>起始</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{currentVal.toFixed(1)}</div>
                    <div style={{ fontSize: 9, color: colors.muted, marginTop: 2 }}>現時</div>
                  </div>
                </div>
              </ChartCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}
