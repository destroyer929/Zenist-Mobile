import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { Search as SearchIcon, X, CheckCircle2, Hash } from 'lucide-react-native';

const SearchScreen = ({ route }) => {
  const navigation = useNavigation();
  const { tasks, toggleTask } = useTasks();
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState(route.params?.initialQuery || '');

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.project.toLowerCase().includes(query.toLowerCase())
  );

  const handleToggle = (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleTask(id);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'transparent' : colors.bgDeep }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textWhite }]}>Search</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>{tasks.length} missions indexed</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
          <SearchIcon color={colors.textMuted} size={18} />
          <TextInput
            style={[styles.input, { color: colors.textWhite }]}
            placeholder="Search missions, projects..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={[styles.clearBtn, { backgroundColor: colors.glass }]}>
              <X color={colors.textMuted} size={14} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {query.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Type to find your path</Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Search by mission name or project</Text>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌫</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No missions found</Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Try a different search term</Text>
          </View>
        ) : (
          <>
            <Text style={[styles.resultCount, { color: colors.textMuted }]}>{filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''}</Text>
            {filteredTasks.map(task => (
              <Pressable 
                key={task.id} 
                onPress={() => handleToggle(task.id)}
                style={[styles.taskItem, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}
              >
                <View style={[styles.checkbox, { borderColor: colors.checkboxBorder }, task.completed && { backgroundColor: colors.gold, borderColor: colors.gold }]}>
                  {task.completed && <CheckCircle2 color={isDark ? colors.bgDeep : '#fff'} size={13} />}
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskText, { color: colors.textWhite }, task.completed && styles.completedText]} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <View style={styles.taskMeta}>
                    <Hash color={colors.gold} size={10} />
                    <Text style={[styles.projectTag, { color: colors.gold }]}>{task.project}</Text>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <Text style={[styles.subCount, { color: colors.textMuted }]}>
                        · {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} steps
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 64, paddingHorizontal: 24, marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  // Search
  searchWrapper: { paddingHorizontal: 24, marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52, borderRadius: 18, borderWidth: 1 },
  input: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '500' },
  clearBtn: { width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  // Results
  scroll: { paddingHorizontal: 24, paddingBottom: 180 },
  resultCount: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, marginLeft: 4 },
  // Tasks
  taskItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, marginBottom: 8, borderWidth: 1 },
  checkbox: { width: 22, height: 22, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  taskInfo: { flex: 1 },
  taskText: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  taskMeta: { flexDirection: 'row', alignItems: 'center' },
  projectTag: { fontSize: 10, fontWeight: '700', marginLeft: 3 },
  subCount: { fontSize: 10, fontWeight: '500', marginLeft: 4 },
  completedText: { textDecorationLine: 'line-through', opacity: 0.35 },
  // Empty
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  emptyHint: { fontSize: 12, marginTop: 4, opacity: 0.6 },
});

export default SearchScreen;
