import { useState, useMemo, type CSSProperties } from 'react';
import { colors, bodyPartColors } from '../theme/tokens';
import { BODY_PARTS, BODY_PART_ORDER } from '../constants/exercises';
import { SearchBar } from '../components/SearchBar';
import { BodyPartChip } from '../components/BodyPartChip';
import { Modal } from '../components/Modal';
import { useApp } from '../context/AppContext';

interface ExercisePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exerciseName: string, bodyPart: string) => void;
  selectedExercises?: string[];
}

export function ExercisePicker({ open, onClose, onSelect, selectedExercises = [] }: ExercisePickerProps) {
  const { customExercises: { customExercises } } = useApp();
  const [search, setSearch] = useState('');
  const [filterPart, setFilterPart] = useState<string | null>(null);

  const allExercises = useMemo(() => {
    const result: { name: string; bodyPart: string; isCustom?: boolean }[] = [];
    for (const bp of BODY_PART_ORDER) {
      for (const name of BODY_PARTS[bp]) {
        result.push({ name, bodyPart: bp });
      }
    }
    for (const ce of customExercises) {
      result.push({ name: ce.name, bodyPart: ce.bodyPart, isCustom: true });
    }
    return result;
  }, [customExercises]);

  const filtered = useMemo(() =>
    allExercises.filter(e => {
      const matchPart = !filterPart || e.bodyPart === filterPart;
      const matchSearch = !search || e.name.includes(search);
      return matchPart && matchSearch;
    }),
    [allExercises, filterPart, search]
  );

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const e of filtered) {
      if (!map[e.bodyPart]) map[e.bodyPart] = [];
      map[e.bodyPart].push(e);
    }
    return map;
  }, [filtered]);

  const sectionHeaderStyle = (bp: string): CSSProperties => ({
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    color: bodyPartColors[bp] ?? colors.muted,
    padding: '10px 16px 6px',
    textTransform: 'uppercase',
  });

  const rowStyle = (selected: boolean): CSSProperties => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: selected ? `${colors.accent}11` : colors.card,
    borderBottom: `1px solid ${colors.border}`,
    cursor: 'pointer',
    transition: 'background 0.1s',
  });

  return (
    <Modal open={open} onClose={onClose}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 16px 12px',
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: colors.text }}>選擇動作</div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: colors.accent, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          完成
        </button>
      </div>

      <div style={{ padding: '12px 16px' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="搜尋動作…" />
      </div>

      {/* Body part filter */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto' }}>
        <BodyPartChip
          bodyPart="全部"
          selected={!filterPart}
          onClick={() => setFilterPart(null)}
        />
        {BODY_PART_ORDER.map(bp => (
          <BodyPartChip
            key={bp}
            bodyPart={bp}
            selected={filterPart === bp}
            onClick={() => setFilterPart(filterPart === bp ? null : bp)}
          />
        ))}
      </div>

      {/* Exercise list */}
      <div style={{ overflowY: 'auto', maxHeight: '55dvh' }}>
        {Object.entries(grouped).map(([bp, exercises]) => (
          <div key={bp}>
            <div style={sectionHeaderStyle(bp)}>{bp}</div>
            {exercises.map(ex => {
              const isSelected = selectedExercises.includes(ex.name);
              return (
                <div
                  key={ex.name}
                  style={rowStyle(isSelected)}
                  onClick={() => { onSelect(ex.name, ex.bodyPart); onClose(); }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: isSelected ? colors.accent : colors.text, fontWeight: isSelected ? 700 : 400 }}>
                      {ex.name}
                    </div>
                    {ex.isCustom && (
                      <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>自訂動作</div>
                    )}
                  </div>
                  <span style={{ color: isSelected ? colors.accent : colors.muted, fontSize: 16, fontWeight: 700 }}>
                    {isSelected ? '✓' : '+'}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: colors.muted, fontSize: 13 }}>
            未找到相關動作
          </div>
        )}
      </div>
    </Modal>
  );
}
