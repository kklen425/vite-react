export const colors = {
  accent: '#C8FF00',
  bg: '#0C0C0C',
  card: '#141414',
  card2: '#1A1A1A',
  border: '#2A2A2A',
  text: '#F0F0F0',
  muted: '#555555',
  red: '#FF4444',
  blue: '#4A9EFF',
  orange: '#F97316',
} as const;

export const bodyPartColors: Record<string, string> = {
  '胸': '#FF6B6B',
  '背': '#4ECDC4',
  '腿': '#45B7D1',
  '膊頭': '#F7DC6F',
  '手臂': '#BB8FCE',
  '核心': '#F0B27A',
};

export const radii = {
  card: 14,
  button: 12,
  badge: 8,
  pill: 20,
} as const;

export const spacing = {
  screenX: 20,
  screenTop: 16,
  cardPad: 16,
  gap: 12,
} as const;
