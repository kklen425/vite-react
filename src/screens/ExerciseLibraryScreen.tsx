import React, { useCallback, useState } from 'react';
import {
  Alert, FlatList, Modal, SafeAreaView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import {
  getAllExercises, createCustomExercise, deleteCustomExercise, countCustomExercises,
} from '../db/repositories/exerciseRepo';
import { useSubscription } from '../hooks/useSubscription';
import { ExerciseCard } from '../components/ExerciseCard';
import { BodyPartFilter } from '../components/BodyPartFilter';
import { theme } from '../utils/theme';
import type { BodyPart, Exercise } from '../types';
import { BODY_PARTS } from '../constants/bodyParts';
import { FREE_CUSTOM_EXERCISE_LIMIT } from '../constants/subscriptionTiers';

export function ExerciseLibraryScreen({ navigation }: {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, '動作庫'>,
    NativeStackNavigationProp<RootStackParamList>
  >
}) {
  const { isPro } = useSubscription();
  const [exercises,    setExercises]    = useState<Exercise[]>([]);
  const [filter,       setFilter]       = useState<BodyPart | null>(null);
  const [search,       setSearch]       = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newName,      setNewName]      = useState('');
  const [newPart,      setNewPart]      = useState<BodyPart>('胸');
  const [saving,       setSaving]       = useState(false);

  const load = useCallback(async () => {
    setExercises(await getAllExercises());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = exercises.filter(e => {
    if (filter && e.body_part !== filter) return false;
    if (search && !e.name.includes(search)) return false;
    return true;
  });

  async function handleDelete(exercise: Exercise) {
    Alert.alert(`刪除 ${exercise.name}`, '確定要刪除這個自訂動作嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除', style: 'destructive',
        onPress: async () => {
          await deleteCustomExercise(exercise.id);
          load();
        },
      },
    ]);
  }

  async function handleCreate() {
    if (!newName.trim()) return;

    // Check free limit
    if (!isPro) {
      const count = await countCustomExercises();
      if (count >= FREE_CUSTOM_EXERCISE_LIMIT) {
        setModalVisible(false);
        Alert.alert(
          '需要 Pro',
          `免費版最多 ${FREE_CUSTOM_EXERCISE_LIMIT} 個自訂動作。升級 Pro 解鎖無限制。`,
          [
            { text: '之後再算', style: 'cancel' },
            { text: '升級 Pro', onPress: () => navigation.navigate('Paywall') },
          ]
        );
        return;
      }
    }

    setSaving(true);
    await createCustomExercise(newName.trim(), newPart);
    await load();
    setNewName('');
    setModalVisible(false);
    setSaving(false);
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="搜尋動作..."
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      <BodyPartFilter selected={filter} onSelect={setFilter} />

      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            showDelete={item.is_custom === 1}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>找不到動作</Text>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color={theme.colors.text} />
      </TouchableOpacity>

      {/* Create modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>新增自訂動作</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.label}>動作名稱</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="例如：啞鈴深蹲"
              placeholderTextColor={theme.colors.textMuted}
              autoFocus
            />

            <Text style={[styles.label, { marginTop: theme.spacing.md }]}>部位</Text>
            <View style={styles.partGrid}>
              {BODY_PARTS.map(bp => (
                <TouchableOpacity
                  key={bp.label}
                  style={[styles.partChip, newPart === bp.label && styles.partChipActive]}
                  onPress={() => setNewPart(bp.label)}>
                  <Text style={[styles.partChipText, newPart === bp.label && styles.partChipTextActive]}>
                    {bp.emoji} {bp.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {!isPro && (
              <View style={styles.limitNote}>
                <Ionicons name="information-circle-outline" size={14} color={theme.colors.textMuted} />
                <Text style={styles.limitText}>
                  免費版限 {FREE_CUSTOM_EXERCISE_LIMIT} 個自訂動作，升級 Pro 可無限新增
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.createBtn, (!newName.trim() || saving) && styles.createBtnDisabled]}
              onPress={handleCreate}
              disabled={!newName.trim() || saving}>
              <Text style={styles.createBtnText}>{saving ? '新增中...' : '新增動作'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  search: { flex: 1, color: theme.colors.text, fontSize: theme.fontSize.md, paddingVertical: theme.spacing.sm },
  list: { padding: theme.spacing.md },
  empty: { color: theme.colors.textMuted, textAlign: 'center', padding: theme.spacing.xl },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modal: { flex: 1, backgroundColor: theme.colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold },
  modalContent: { padding: theme.spacing.md, gap: theme.spacing.sm },
  label: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.medium },
  modalInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  partGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  partChip: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  partChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  partChipText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  partChipTextActive: { color: theme.colors.text, fontWeight: theme.fontWeight.semibold },
  limitNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: theme.spacing.sm,
  },
  limitText: { color: theme.colors.textMuted, fontSize: theme.fontSize.xs, flex: 1 },
  createBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { color: theme.colors.text, fontWeight: theme.fontWeight.bold },
});
