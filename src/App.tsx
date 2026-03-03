"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from "recharts";

/* ───────── Types ───────── */
interface WorkoutRecord {
  id: number;
  date: string;
  bodyPart: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
}

interface FormState {
  date: string;
  bodyPart: string;
  exercise: string;
  weight: string | number;
  reps: string | number;
  sets: string | number;
}

interface StatItem {
  label: string;
  value: number | string;
  unit: string;
}

interface ProgressPoint {
  date: string;
  weight: number;
  volume: number;
  reps: number;
}

interface VolumeItem {
  name: string;
  volume: number;
}

/* ───────── Constants ───────── */
const BODY_PARTS: Record<string, string[]> = {
  "胸": ["槓鈴臥推", "啞鈴臥推", "上斜臥推", "飛鳥夾胸", "繩索夾胸", "掌上壓"],
  "背": ["引體上升", "槓鈴划船", "啞鈴划船", "滑輪下拉", "坐姿划船", "硬拉"],
  "肩": ["啞鈴肩推", "槓鈴肩推", "側平舉", "前平舉", "反向飛鳥", "聳肩"],
  "腿": ["深蹲", "腿推", "腿彎舉", "腿伸展", "保加利亞深蹲", "小腿提踵"],
  "手臂": ["二頭彎舉", "錘式彎舉", "三頭下壓", "法式推舉", "集中彎舉", "過頭臂伸展"],
  "腹": ["捲腹", "懸垂抬腿", "平板支撐", "俄羅斯轉體", "腹肌輪", "側捲腹"],
};

const BODY_PART_EMOJI: Record<string, string> = {
  "胸": "🫁", "背": "🔙", "肩": "💪", "腿": "🦵", "手臂": "💪", "腹": "🎯",
};

const STORAGE_KEY = "fitness-tracker-records";

/* ───────── Helpers ───────── */
const formatDate = (d: string): string => {
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const loadFromStorage = (): WorkoutRecord[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (records: WorkoutRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error("Failed to save:", e);
  }
};

/* ───────── Styles ───────── */
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600, color: "#818cf8",
  letterSpacing: 1, textTransform: "uppercase", marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
  color: "#e0e7ff", fontSize: 14, outline: "none", marginBottom: 16,
  fontFamily: "inherit",
};

const iconBtnStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: 13,
  display: "flex", alignItems: "center", justifyContent: "center",
};

const chartCard: React.CSSProperties = {
  padding: 20, borderRadius: 20, marginBottom: 16,
  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
};

/* ───────── Component ───────── */
export default function FitnessTracker() {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("log");
  const [form, setForm] = useState<FormState>({
    date: new Date().toISOString().split("T")[0],
    bodyPart: "胸",
    exercise: "槓鈴臥推",
    weight: "",
    reps: "",
    sets: "",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [filterPart, setFilterPart] = useState<string>("全部");
  const [progressExercise, setProgressExercise] = useState<string>("槓鈴臥推");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const data = loadFromStorage();
    setRecords(data);
    if (data.length > 0) {
      const exercises = [...new Set(data.map((r: WorkoutRecord) => r.exercise))];
      if (exercises.length > 0) setProgressExercise(exercises[0]);
    }
    setLoading(false);
  }, []);

  const persist = useCallback((next: WorkoutRecord[]) => {
    setRecords(next);
    saveToStorage(next);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleBodyPartChange = (bp: string) => {
    setForm({ ...form, bodyPart: bp, exercise: BODY_PARTS[bp][0] });
  };

  const handleSubmit = () => {
    if ((!form.weight && form.weight !== 0) || !form.reps || !form.sets) {
      showToast("⚠️ 請填寫所有欄位");
      return;
    }
    const entry: WorkoutRecord = {
      id: editId ?? Date.now(),
      date: form.date,
      bodyPart: form.bodyPart,
      exercise: form.exercise,
      weight: Number(form.weight),
      reps: Number(form.reps),
      sets: Number(form.sets),
    };

    if (editId) {
      persist(records.map((r: WorkoutRecord) => (r.id === editId ? entry : r)));
      setEditId(null);
      showToast("✅ 已更新記錄");
    } else {
      persist([...records, entry]);
      showToast("💪 記錄已儲存！");
    }
    setForm({ ...form, weight: "", reps: "", sets: "" });
  };

  const handleEdit = (r: WorkoutRecord) => {
    setForm({ date: r.date, bodyPart: r.bodyPart, exercise: r.exercise, weight: r.weight, reps: r.reps, sets: r.sets });
    setEditId(r.id);
    setActiveTab("log");
  };

  const handleDelete = (id: number) => {
    persist(records.filter((r: WorkoutRecord) => r.id !== id));
    showToast("🗑️ 已刪除");
  };

  const handleClearAll = () => {
    persist([]);
    showToast("🧹 已清除所有記錄");
  };

  const filteredRecords = useMemo<WorkoutRecord[]>(() => {
    const sorted = [...records].sort(
      (a: WorkoutRecord, b: WorkoutRecord) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return filterPart === "全部" ? sorted : sorted.filter((r: WorkoutRecord) => r.bodyPart === filterPart);
  }, [records, filterPart]);

  const groupedByDate = useMemo<Record<string, WorkoutRecord[]>>(() => {
    const groups: Record<string, WorkoutRecord[]> = {};
    filteredRecords.forEach((r: WorkoutRecord) => {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
    });
    return groups;
  }, [filteredRecords]);

  const progressData = useMemo<ProgressPoint[]>(() => {
    return records
      .filter((r: WorkoutRecord) => r.exercise === progressExercise)
      .sort((a: WorkoutRecord, b: WorkoutRecord) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((r: WorkoutRecord) => ({
        date: formatDate(r.date),
        weight: r.weight,
        volume: r.weight * r.reps * r.sets,
        reps: r.reps,
      }));
  }, [records, progressExercise]);

  const allExercises = useMemo<string[]>(
    () => [...new Set(records.map((r: WorkoutRecord) => r.exercise))],
    [records]
  );

  const weeklyVolume = useMemo<VolumeItem[]>(() => {
    const vol: Record<string, number> = {};
    records.forEach((r: WorkoutRecord) => {
      if (!vol[r.bodyPart]) vol[r.bodyPart] = 0;
      vol[r.bodyPart] += r.weight * r.reps * r.sets;
    });
    return Object.entries(vol).map(([name, volume]: [string, number]) => ({ name, volume }));
  }, [records]);

  const stats = useMemo(() => {
    const totalVolume = records.reduce((s: number, r: WorkoutRecord) => s + r.weight * r.reps * r.sets, 0);
    return {
      totalSessions: new Set(records.map((r: WorkoutRecord) => r.date)).size,
      totalVolume,
      totalSets: records.reduce((s: number, r: WorkoutRecord) => s + r.sets, 0),
    };
  }, [records]);

  const statItems: StatItem[] = [
    { label: "訓練日", value: stats.totalSessions, unit: "日" },
    {
      label: "總容量",
      value: stats.totalVolume >= 1000 ? (stats.totalVolume / 1000).toFixed(1) : stats.totalVolume,
      unit: stats.totalVolume >= 1000 ? "噸" : "kg",
    },
    { label: "總組數", value: stats.totalSets, unit: "組" },
  ];

  const tabs = [
    { key: "log", label: "記錄", icon: "✏️" },
    { key: "history", label: "歷史", icon: "📋" },
    { key: "progress", label: "進步", icon: "📈" },
  ];

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(165deg, #0a0a0f 0%, #111127 40%, #0d1117 100%)",
        color: "#818cf8", fontFamily: "'Noto Sans TC', sans-serif", fontSize: 16,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16, animation: "pulse 1.5s infinite" }}>🏋️</div>
          <div>載入緊你嘅記錄...</div>
        </div>
        <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(165deg, #0a0a0f 0%, #111127 40%, #0d1117 100%)",
      color: "#e8e8f0",
      fontFamily: "'Noto Sans TC', 'SF Pro Display', -apple-system, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "fixed", top: "-30%", right: "-20%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      {toast && (
        <div style={{
          position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 999,
          background: "rgba(20,20,40,0.95)", border: "1px solid rgba(99,102,241,0.3)",
          padding: "12px 24px", borderRadius: 12, backdropFilter: "blur(20px)",
          fontSize: 14, fontWeight: 500, color: "#c4b5fd", animation: "slideDown 0.3s ease",
        }}>{toast}</div>
      )}

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ padding: "32px 0 20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#6366f1", fontWeight: 600, marginBottom: 8 }}>
            Workout Tracker
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #e0e7ff, #c4b5fd, #f0abfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            健身記錄簿
          </h1>
          <div style={{ fontSize: 11, color: "#4ade80", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            自動儲存開啟中 · 關閉後數據唔會消失
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
            {statItems.map((s: StatItem, i: number) => (
              <div key={i} style={{ flex: 1, padding: "14px 8px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#e0e7ff" }}>
                  {s.value}<span style={{ fontSize: 11, fontWeight: 400, color: "#818cf8", marginLeft: 2 }}>{s.unit}</span>
                </div>
                <div style={{ fontSize: 10, color: "#6366f1", letterSpacing: 1, marginTop: 2, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 24 }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              flex: 1, padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, transition: "all 0.2s",
              background: activeTab === t.key ? "rgba(99,102,241,0.15)" : "transparent",
              color: activeTab === t.key ? "#a5b4fc" : "#4b5563",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ═══ LOG ═══ */}
        {activeTab === "log" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 18 }}>{editId ? "✏️" : "🏋️"}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#e0e7ff" }}>{editId ? "編輯記錄" : "新增記錄"}</span>
              </div>

              <label style={labelStyle}>📅 日期</label>
              <input type="date" value={form.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, date: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>🎯 訓練部位</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 16 }}>
                {Object.keys(BODY_PARTS).map((bp: string) => (
                  <button key={bp} onClick={() => handleBodyPartChange(bp)} style={{
                    padding: "10px 0", borderRadius: 10, border: "1px solid",
                    borderColor: form.bodyPart === bp ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.06)",
                    background: form.bodyPart === bp ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)",
                    color: form.bodyPart === bp ? "#a5b4fc" : "#6b7280",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                  }}>
                    {BODY_PART_EMOJI[bp]} {bp}
                  </button>
                ))}
              </div>

              <label style={labelStyle}>🏋️ 動作</label>
              <select value={form.exercise} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, exercise: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                {BODY_PARTS[form.bodyPart].map((ex: string) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>⚖️ 重量(kg)</label>
                  <input type="number" placeholder="0" value={form.weight} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, weight: e.target.value })} style={inputStyle} min="0" step="0.5" />
                </div>
                <div>
                  <label style={labelStyle}>🔄 次數</label>
                  <input type="number" placeholder="0" value={form.reps} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, reps: e.target.value })} style={inputStyle} min="1" />
                </div>
                <div>
                  <label style={labelStyle}>📦 組數</label>
                  <input type="number" placeholder="0" value={form.sets} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, sets: e.target.value })} style={inputStyle} min="1" />
                </div>
              </div>

              <button onClick={handleSubmit} style={{
                width: "100%", padding: "14px 0", borderRadius: 14, border: "none", cursor: "pointer",
                fontSize: 15, fontWeight: 700,
                background: editId ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", transition: "all 0.2s", boxShadow: "0 4px 20px rgba(99,102,241,0.25)",
              }}>
                {editId ? "💾 更新記錄" : "💪 儲存記錄"}
              </button>
              {editId && (
                <button onClick={() => { setEditId(null); setForm({ ...form, weight: "", reps: "", sets: "" }); }} style={{
                  width: "100%", padding: "12px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent", color: "#6b7280", fontSize: 13, cursor: "pointer", marginTop: 8,
                }}>
                  取消編輯
                </button>
              )}
            </div>
          </div>
        )}

        {/* ═══ HISTORY ═══ */}
        {activeTab === "history" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              {["全部", ...Object.keys(BODY_PARTS)].map((bp: string) => (
                <button key={bp} onClick={() => setFilterPart(bp)} style={{
                  padding: "8px 14px", borderRadius: 10, border: "1px solid",
                  borderColor: filterPart === bp ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.06)",
                  background: filterPart === bp ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)",
                  color: filterPart === bp ? "#a5b4fc" : "#6b7280",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>
                  {bp}
                </button>
              ))}
              {records.length > 0 && (
                <button onClick={handleClearAll} style={{
                  marginLeft: "auto", padding: "8px 14px", borderRadius: 10,
                  border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)",
                  color: "#f87171", fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}>
                  🧹 清除全部
                </button>
              )}
            </div>

            {Object.keys(groupedByDate).length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#4b5563" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🏋️</div>
                未有記錄，快啲去操啦！
              </div>
            )}

            {Object.entries(groupedByDate).map(([date, recs]: [string, WorkoutRecord[]]) => (
              <div key={date} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "0 4px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#818cf8" }}>{date}</div>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                  <div style={{ fontSize: 11, color: "#4b5563" }}>{recs.length} 個動作</div>
                </div>
                {recs.map((r: WorkoutRecord) => (
                  <div key={r.id} style={{
                    padding: "14px 16px", borderRadius: 14, marginBottom: 6,
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0,
                    }}>
                      {BODY_PART_EMOJI[r.bodyPart] || "💪"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e7ff" }}>{r.exercise}</div>
                      <div style={{ fontSize: 12, color: "#818cf8", marginTop: 2 }}>
                        {r.weight}kg × {r.reps}次 × {r.sets}組
                        <span style={{ color: "#4b5563", marginLeft: 8 }}>= {r.weight * r.reps * r.sets}kg</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => handleEdit(r)} style={iconBtnStyle} title="編輯">✏️</button>
                      <button onClick={() => handleDelete(r.id)} style={iconBtnStyle} title="刪除">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ═══ PROGRESS ═══ */}
        {activeTab === "progress" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ padding: 20, borderRadius: 20, marginBottom: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <label style={{ ...labelStyle, marginBottom: 8 }}>📊 追蹤動作</label>
              {allExercises.length > 0 ? (
                <select value={progressExercise} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProgressExercise(e.target.value)} style={{ ...inputStyle, cursor: "pointer", marginBottom: 0 }}>
                  {allExercises.map((ex: string) => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              ) : (
                <div style={{ color: "#4b5563", fontSize: 13 }}>未有記錄</div>
              )}
            </div>

            {progressData.length < 2 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#4b5563" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📈</div>
                需要至少兩次記錄先可以睇到進步趨勢
              </div>
            ) : (
              <>
                <div style={chartCard}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e7ff", marginBottom: 16 }}>⚖️ 重量趨勢 (kg)</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                      <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, fontSize: 12, color: "#e0e7ff" }} />
                      <Line type="monotone" dataKey="weight" stroke="#818cf8" strokeWidth={3} dot={{ fill: "#6366f1", r: 5, strokeWidth: 2, stroke: "#1e1b4b" }} activeDot={{ r: 7, fill: "#a5b4fc" }} />
                    </LineChart>
                  </ResponsiveContainer>
                  {progressData.length >= 2 && (() => {
                    const first = progressData[0].weight;
                    const last = progressData[progressData.length - 1].weight;
                    const diff = last - first;
                    return diff !== 0 ? (
                      <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: diff > 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${diff > 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, fontSize: 12, color: diff > 0 ? "#4ade80" : "#f87171" }}>
                        {diff > 0 ? "📈" : "📉"} 重量{diff > 0 ? "增加" : "減少"}咗 {Math.abs(diff)}kg（{first}kg → {last}kg）
                      </div>
                    ) : null;
                  })()}
                </div>

                <div style={chartCard}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e7ff", marginBottom: 16 }}>📦 容量趨勢 (kg)</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                      <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(236,72,153,0.3)", borderRadius: 10, fontSize: 12, color: "#e0e7ff" }} />
                      <Bar dataKey="volume" fill="url(#volumeGrad)" radius={[6, 6, 0, 0]} />
                      <defs>
                        <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c084fc" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {weeklyVolume.length > 0 && (
              <div style={chartCard}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e7ff", marginBottom: 16 }}>🎯 各部位總容量</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyVolume} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#a5b4fc", fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} width={40} />
                    <Tooltip contentStyle={{ background: "rgba(15,15,30,0.95)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, fontSize: 12, color: "#e0e7ff" }} />
                    <Bar dataKey="volume" fill="url(#partGrad)" radius={[0, 6, 6, 0]} />
                    <defs>
                      <linearGradient id="partGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        select option { background: #1a1a2e; color: #e0e7ff; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
      `}</style>
    </div>
  );
}