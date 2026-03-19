import type { BodyPart } from '../types';

export const BODY_PARTS: { label: BodyPart; emoji: string; color: string }[] = [
  { label: '胸',  emoji: '💪', color: '#e74c3c' },
  { label: '背',  emoji: '🏋️', color: '#3498db' },
  { label: '腿',  emoji: '🦵', color: '#2ecc71' },
  { label: '膊頭', emoji: '🔝', color: '#9b59b6' },
  { label: '手臂', emoji: '💪', color: '#f39c12' },
  { label: '核心', emoji: '🎯', color: '#1abc9c' },
];

export const BODY_PART_COLOR: Record<BodyPart, string> = {
  '胸': '#e74c3c',
  '背': '#3498db',
  '腿': '#2ecc71',
  '膊頭': '#9b59b6',
  '手臂': '#f39c12',
  '核心': '#1abc9c',
};
