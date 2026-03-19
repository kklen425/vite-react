export const REVENUECAT_API_KEY_IOS = 'appl_YOUR_IOS_KEY_HERE';
export const REVENUECAT_API_KEY_ANDROID = 'goog_YOUR_ANDROID_KEY_HERE';

export const ENTITLEMENT_PRO = 'pro';

export const PRODUCT_MONTHLY = 'fitness_pro_monthly';
export const PRODUCT_YEARLY = 'fitness_pro_yearly';

export type ProFeature =
  | 'fullHistory'
  | 'allCharts'
  | 'bodyMetrics'
  | 'exportData'
  | 'customRestTimer'
  | 'progressiveOverload'
  | 'unlimitedCustomExercises';

export const PRO_FEATURES: Record<ProFeature, string> = {
  fullHistory:              '完整訓練歷史',
  allCharts:                '所有動作進步圖表',
  bodyMetrics:              '身體數據追蹤',
  exportData:               '匯出數據',
  customRestTimer:          '自訂休息計時器',
  progressiveOverload:      '漸進超負荷建議',
  unlimitedCustomExercises: '無限自訂動作',
};

// Free tier limits
export const FREE_HISTORY_DAYS = 7;
export const FREE_CHART_LIMIT = 1;
export const FREE_CUSTOM_EXERCISE_LIMIT = 1;
export const FREE_REST_TIMER_SECONDS = 90;
