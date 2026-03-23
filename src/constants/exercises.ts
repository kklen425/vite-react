import type { BodyPart } from '../types';

export interface SeedExercise {
  name: string;
  body_part: BodyPart;
}

export const SEED_EXERCISES: SeedExercise[] = [
  // 胸
  { name: '槓鈴臥推',   body_part: '胸' },
  { name: '啞鈴臥推',   body_part: '胸' },
  { name: '上斜臥推',   body_part: '胸' },
  { name: '飛鳥',      body_part: '胸' },
  { name: '繩索夾胸',   body_part: '胸' },
  { name: '掌上壓',    body_part: '胸' },

  // 背
  { name: '引體上升',   body_part: '背' },
  { name: '槓鈴划船',   body_part: '背' },
  { name: '啞鈴划船',   body_part: '背' },
  { name: '坐姿划船',   body_part: '背' },
  { name: '高位下拉',   body_part: '背' },
  { name: '硬舉',      body_part: '背' },

  // 腿
  { name: '深蹲',      body_part: '腿' },
  { name: '腿推舉',    body_part: '腿' },
  { name: '腿彎舉',    body_part: '腿' },
  { name: '腿伸展',    body_part: '腿' },
  { name: '弓步蹲',    body_part: '腿' },
  { name: '小腿提踵',  body_part: '腿' },

  // 膊頭
  { name: '肩推',      body_part: '膊頭' },
  { name: '啞鈴側平舉', body_part: '膊頭' },
  { name: '啞鈴前平舉', body_part: '膊頭' },
  { name: '面拉',      body_part: '膊頭' },
  { name: '聳肩',      body_part: '膊頭' },

  // 手臂
  { name: '槓鈴彎舉',   body_part: '手臂' },
  { name: '啞鈴彎舉',   body_part: '手臂' },
  { name: '三頭肌下壓',  body_part: '手臂' },
  { name: '過頭三頭伸展', body_part: '手臂' },
  { name: '錘式彎舉',   body_part: '手臂' },

  // 核心
  { name: '捲腹',      body_part: '核心' },
  { name: '平板支撐',  body_part: '核心' },
  { name: '俄羅斯轉體', body_part: '核心' },
  { name: '懸垂舉腿',  body_part: '核心' },
];
