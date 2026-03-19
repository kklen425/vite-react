import React, { useEffect, useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Switch, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store/useUserStore';
import { useSubscription } from '../hooks/useSubscription';
import { restorePurchases } from '../services/purchaseService';
import {
  requestNotificationPermission,
  scheduleWorkoutReminder,
  cancelWorkoutReminder,
} from '../services/notificationService';
import { theme } from '../utils/theme';
import type { Goal, Experience } from '../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'> };

export function SettingsScreen({ navigation }: Props) {
  const profile   = useUserStore(s => s.profile);
  const save      = useUserStore(s => s.saveProfile);
  const { isPro } = useSubscription();

  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifTime,    setNotifTime]    = useState('08:00');
  const [restTimer,    setRestTimer]    = useState('90');
  const [restoring,    setRestoring]    = useState(false);

  useEffect(() => {
    if (profile) {
      setNotifEnabled(profile.notification_enabled === 1);
      setNotifTime(profile.notification_time);
      setRestTimer(String(profile.rest_timer_default));
    }
  }, [profile]);

  async function toggleNotification(value: boolean) {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('需要通知權限', '請在系統設定中啟用通知權限。');
        return;
      }
      await scheduleWorkoutReminder(notifTime);
    } else {
      await cancelWorkoutReminder();
    }
    setNotifEnabled(value);
    await save({ notification_enabled: value ? 1 : 0 });
  }

  async function saveNotifTime() {
    await save({ notification_time: notifTime });
    if (notifEnabled) await scheduleWorkoutReminder(notifTime);
  }

  async function saveRestTimer() {
    const secs = parseInt(restTimer, 10);
    if (isNaN(secs) || secs < 10) return;
    await save({ rest_timer_default: secs });
  }

  async function handleRestore() {
    setRestoring(true);
    const ok = await restorePurchases();
    setRestoring(false);
    Alert.alert(ok ? '恢復成功 ✅' : '未找到訂閱', ok ? '你嘅 Pro 功能已恢復' : '此 Apple/Google 帳號沒有有效訂閱');
  }

  const GOALS: Goal[]       = ['增肌', '減脂', '健體'];
  const EXPS:  Experience[] = ['新手', '中級', '高級'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Subscription status */}
      <View style={[styles.card, isPro && styles.proCard]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons
              name={isPro ? 'diamond' : 'diamond-outline'}
              size={24}
              color={isPro ? theme.colors.gold : theme.colors.textSecondary}
            />
            <View>
              <Text style={styles.rowTitle}>{isPro ? '健身 Pro 👑' : '免費版'}</Text>
              <Text style={styles.rowSub}>{isPro ? '所有功能已解鎖' : '升級解鎖全部功能'}</Text>
            </View>
          </View>
          {!isPro && (
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => navigation.navigate('Paywall')}>
              <Text style={styles.upgradeBtnText}>升級</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Profile */}
      <Text style={styles.sectionTitle}>個人資料</Text>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>訓練目標</Text>
        <View style={styles.chipRow}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.chip, profile?.goal === g && styles.chipActive]}
              onPress={() => save({ goal: g })}>
              <Text style={[styles.chipText, profile?.goal === g && styles.chipTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { marginTop: theme.spacing.md }]}>訓練經驗</Text>
        <View style={styles.chipRow}>
          {EXPS.map(e => (
            <TouchableOpacity
              key={e}
              style={[styles.chip, profile?.experience === e && styles.chipActive]}
              onPress={() => save({ experience: e })}>
              <Text style={[styles.chipText, profile?.experience === e && styles.chipTextActive]}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Rest timer (Pro only) */}
      <Text style={styles.sectionTitle}>休息計時器</Text>
      <View style={styles.card}>
        {isPro ? (
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="timer-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.rowTitle}>預設時間 (秒)</Text>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.numInput}
                value={restTimer}
                onChangeText={setRestTimer}
                keyboardType="number-pad"
                onEndEditing={saveRestTimer}
              />
              <Text style={styles.unit}>秒</Text>
            </View>
          </View>
        ) : (
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />
              <View>
                <Text style={styles.rowTitle}>自訂休息時間</Text>
                <Text style={styles.rowSub}>Pro 功能 · 現為固定 90 秒</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Paywall')}>
              <Text style={styles.unlockText}>解鎖</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notifications */}
      <Text style={styles.sectionTitle}>提醒</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.rowTitle}>訓練提醒</Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={toggleNotification}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            thumbColor={theme.colors.text}
          />
        </View>
        {notifEnabled && (
          <View style={[styles.row, { marginTop: theme.spacing.sm }]}>
            <Text style={styles.fieldLabel}>提醒時間</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.numInput}
                value={notifTime}
                onChangeText={setNotifTime}
                placeholder="08:00"
                placeholderTextColor={theme.colors.textMuted}
                onEndEditing={saveNotifTime}
              />
            </View>
          </View>
        )}
      </View>

      {/* Restore purchases */}
      <TouchableOpacity
        style={styles.restoreBtn}
        onPress={handleRestore}
        disabled={restoring}>
        <Ionicons name="refresh-outline" size={18} color={theme.colors.textSecondary} />
        <Text style={styles.restoreBtnText}>
          {restoring ? '恢復中...' : '恢復已購項目'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  proCard: { borderColor: theme.colors.gold + '60', backgroundColor: theme.colors.gold + '08' },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 },
  rowTitle: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium },
  rowSub: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs },
  upgradeBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
  },
  upgradeBtnText: { color: theme.colors.text, fontWeight: theme.fontWeight.bold, fontSize: theme.fontSize.sm },
  fieldLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  chipRow: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  chip: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceAlt,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  chipTextActive: { color: theme.colors.text, fontWeight: theme.fontWeight.semibold },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  numInput: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 60,
    textAlign: 'center',
  },
  unit: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  unlockText: { color: theme.colors.primary, fontWeight: theme.fontWeight.semibold },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  restoreBtnText: { color: theme.colors.textSecondary },
});
