import React, { useEffect, useState } from 'react';
import {
  FlatList, Modal, StyleSheet, Text, TextInput,
  TouchableOpacity, View, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BodyPart, Exercise } from '../types';
import { getAllExercises } from '../db/repositories/exerciseRepo';
import { ExerciseCard } from './ExerciseCard';
import { BodyPartFilter } from './BodyPartFilter';
import { theme } from '../utils/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  excludeIds?: number[];
}

export function ExercisePicker({ visible, onClose, onSelect, excludeIds = [] }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState<BodyPart | null>(null);

  useEffect(() => {
    if (visible) getAllExercises().then(setExercises);
  }, [visible]);

  const filtered = exercises.filter(e => {
    if (excludeIds.includes(e.id)) return false;
    if (filter && e.body_part !== filter) return false;
    if (search && !e.name.includes(search)) return false;
    return true;
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>選擇動作</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
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
              onPress={() => { onSelect(item); onClose(); }}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>找不到動作</Text>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: { marginRight: theme.spacing.sm },
  search: { flex: 1, color: theme.colors.text, fontSize: theme.fontSize.md, paddingVertical: theme.spacing.sm },
  list: { padding: theme.spacing.md },
  empty: { color: theme.colors.textMuted, textAlign: 'center', padding: theme.spacing.xl },
});
