import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSubscription } from '../hooks/useSubscription';
import {
  getAllBodyMetrics, upsertBodyMetrics, deleteBodyMetrics, getLatestBodyMetrics,
} from '../db/repositories/bodyMetricsRepo';
import { PaywallGate } from '../components/PaywallGate';
import { theme } from '../utils/theme';
import { todayISO, formatDate } from '../utils/formatters';
import type { BodyMetrics } from '../types';

export function BodyScreen({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList, 'Body'> }) {
  const { isPro } = useSubscription();

  if (!isPro) {
    return <PaywallGate feature="bodyMetrics"><View /></PaywallGate>;
  }

  return <BodyScreenContent />;
}

function BodyScreenContent() {
  const [metrics,  setMetrics]  = useState<BodyMetrics[]>([]);
  const [weight,   setWeight]   = useState('');
  const [fat,      setFat]      = useState('');
  const [waist,    setWaist]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const today = todayISO();

  async function load() {
    const data = await getAllBodyMetrics();
    setMetrics(data);
    // Pre-fill today's data if exists
    const todayData = data.find(d => d.date === today);
    if (todayData) {
      setWeight(String(todayData.weight));
      setFat(todayData.body_fat_pct != null ? String(todayData.body_fat_pct) : '');
      setWaist(todayData.waist_cm != null ? String(todayData.waist_cm) : '');
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  async function handleSave() {
    const w = parseFloat(weight);
    if (!w || w <= 0) {
      Alert.alert('請輸入體重');
      return;
    }
    setLoading(true);
    await upsertBodyMetrics(
      today,
      w,
      fat   ? parseFloat(fat)   : null,
      waist ? parseFloat(waist) : null
    );
    await load();
    setLoading(false);
  }

  const latest  = metrics[0];
  const previous = metrics[1];
  const weightDiff = latest && previous
    ? (latest.weight - previous.weight).toFixed(1)
    : null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Today's input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>今日數據</Text>
          <Text style={styles.cardSub}>{formatDate(today)}</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>體重 (kg) *</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="70.0"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>體脂 % (選填)</Text>
              <TextInput
                style={styles.input}
                value={fat}
                onChangeText={setFat}
                keyboardType="decimal-pad"
                placeholder="15.0"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <View style={styles.inputField}>
              <Text style={styles.inputLabel}>腰圍 cm (選填)</Text>
              <TextInput
                style={styles.input}
                value={waist}
                onChangeText={setWaist}
                keyboardType="decimal-pad"
                placeholder="80.0"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={loading}>
            <Text style={styles.saveBtnText}>{loading ? '儲存中...' : '儲存今日數據'}</Text>
          </TouchableOpacity>
        </View>

        {/* Current stats */}
        {latest && (
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>最新狀態</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{latest.weight}kg</Text>
                <Text style={styles.statLabel}>體重</Text>
                {weightDiff && (
                  <Text style={[
                    styles.statDiff,
                    parseFloat(weightDiff) > 0 ? styles.diffUp : styles.diffDown,
                  ]}>
                    {parseFloat(weightDiff) > 0 ? '+' : ''}{weightDiff}
                  </Text>
                )}
              </View>
              {latest.body_fat_pct != null && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{latest.body_fat_pct}%</Text>
                  <Text style={styles.statLabel}>體脂</Text>
                </View>
              )}
              {latest.waist_cm != null && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{latest.waist_cm}cm</Text>
                  <Text style={styles.statLabel}>腰圍</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* History */}
        {metrics.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>歷史記錄</Text>
            {metrics.slice(0, 10).map(m => (
              <View key={m.id} style={styles.historyRow}>
                <Text style={styles.historyDate}>{formatDate(m.date)}</Text>
                <Text style={styles.historyWeight}>{m.weight}kg</Text>
                {m.body_fat_pct != null && (
                  <Text style={styles.historyExtra}>{m.body_fat_pct}%</Text>
                )}
                <TouchableOpacity
                  onPress={async () => {
                    await deleteBodyMetrics(m.id);
                    load();
                  }}>
                  <Ionicons name="trash-outline" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, gap: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold },
  cardSub: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  inputRow: { flexDirection: 'row', gap: theme.spacing.sm },
  inputField: { flex: 1 },
  inputLabel: { color: theme.colors.textMuted, fontSize: theme.fontSize.xs, marginBottom: 4 },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: theme.colors.text, fontWeight: theme.fontWeight.bold },
  statsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { color: theme.colors.text, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.heavy },
  statLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs },
  statDiff: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold },
  diffUp: { color: theme.colors.danger },
  diffDown: { color: theme.colors.success },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    marginTop: theme.spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyDate: { flex: 1, color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  historyWeight: { color: theme.colors.text, fontWeight: theme.fontWeight.semibold },
  historyExtra: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
});
