import { useState, useMemo, type CSSProperties } from 'react';
import { colors, radii, bodyPartColors, spacing } from '../theme/tokens';
import { screenContainer, screenPad, accentBtnStyle } from '../theme/styles';
import { BODY_PARTS, BODY_PART_ORDER } from '../constants/exercises';
import { SearchBar } from '../components/SearchBar';
import { BodyPartChip } from '../components/BodyPartChip';
import { Modal } from '../components/Modal';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/EmptyState';

export function ExerciseLibraryScreen() {
  const { customExercises: { customExercises, addCustomExercise, deleteCustomExercise }, workouts: { workouts } } = useApp();
  const [search, setSearch] = useState('');
  const [filterPart, setFilterPart] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBodyPart, setNewBodyPart] = useState(BODY_PART_ORDER[0]);

  // Last used info per exercise
  const lastUsed = useMemo(() => {
    const map: Record<string, { weight: number; date: string }> = {};
    for (const w of workouts) {
      for (const ex of w.exercises) {
        if (!map[ex.exerciseName] || w.date > map[ex.exerciseName].date) {
          const maxW = Math.max(...ex.sets.map(s => s.weight));
          map[ex.exerciseName] = { weight: maxW, date: w.date };
        }
      }
    }
    return map;
  }, [workouts]);

  const sections = useMemo(() => {
    return BODY_PART_ORDER
      .filter(bp => !filterPart || bp === filterPart)
      .map(bp => {
        const builtIn = BODY_PARTS[bp].filter(n => !search || n.includes(search));
        const custom = customExercises.filter(e => e.bodyPart === bp && (!search || e.name.includes(search)));
        return { bodyPart: bp, exercises: builtIn, custom };
      })
      .filter(s => s.exercises.length > 0 || s.custom.length > 0);
  }, [filterPart, search, customExercises]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCustomExercise(newName.trim(), newBodyPart);
    setNewName('');
    setAddModalOpen(false);
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
    <div style={screenContainer}>
      <div style={screenPad}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>動作庫</div>
          <button
            onClick={() => setAddModalOpen(true)}
            style={{
              background: `${colors.accent}22`,
              border: `1px solid ${colors.accent}66`,
              borderRadius: radii.pill,
              color: colors.accent,
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 14px',
              cursor: 'pointer',
            }}
          >
            ＋ 自訂
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="搜尋動作…" />
        </div>

        {/* Body part filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          <BodyPartChip bodyPart="全部" selected={!filterPart} onClick={() => setFilterPart(null)} />
          {BODY_PART_ORDER.map(bp => (
            <BodyPartChip
              key={bp}
              bodyPart={bp}
              selected={filterPart === bp}
              onClick={() => setFilterPart(filterPart === bp ? null : bp)}
            />
          ))}
        </div>

        {sections.length === 0 ? (
          <EmptyState icon="🔍" title="找不到相關動作" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.gap }}>
            {sections.map(section => {
              const bpColor = bodyPartColors[section.bodyPart] ?? colors.muted;
              return (
                <div key={section.bodyPart}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: bpColor, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
                    {section.bodyPart}
                  </div>
                  <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: radii.card, overflow: 'hidden' }}>
                    {[
                      ...section.exercises.map(n => ({ name: n, isCustom: false, customId: '' })),
                      ...section.custom.map(e => ({ name: e.name, isCustom: true, customId: e.id })),
                    ].map((ex, i, arr) => {
                      const lu = lastUsed[ex.name];
                      return (
                        <div
                          key={ex.name}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 12, color: colors.text }}>{ex.name}</span>
                              {ex.isCustom && (
                                <span style={{
                                  background: `${colors.accent}22`,
                                  border: `1px solid ${colors.accent}44`,
                                  color: colors.accent,
                                  fontSize: 9,
                                  fontWeight: 700,
                                  borderRadius: 4,
                                  padding: '1px 5px',
                                }}>自訂</span>
                              )}
                            </div>
                            {lu && (
                              <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                                上次：{lu.weight}kg
                              </div>
                            )}
                          </div>
                          {ex.isCustom && ex.customId && (
                            <button
                              onClick={() => deleteCustomExercise(ex.customId)}
                              style={{ background: 'none', border: 'none', color: colors.muted, fontSize: 14, cursor: 'pointer' }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add custom exercise modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: colors.text, marginBottom: 16 }}>新增自訂動作</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>動作名稱</div>
              <input
                style={inputStyle}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="輸入動作名稱…"
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>訓練部位</div>
              <select
                style={{ ...inputStyle }}
                value={newBodyPart}
                onChange={e => setNewBodyPart(e.target.value)}
              >
                {BODY_PART_ORDER.map(bp => <option key={bp} value={bp}>{bp}</option>)}
              </select>
            </div>
            <button style={accentBtnStyle} onClick={handleAdd}>新增動作</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
