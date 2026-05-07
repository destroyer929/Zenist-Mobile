import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle2, Clock, Calendar, Bell, Sunrise, Sun, Sunset } from 'lucide-react-native';
import dayjs from 'dayjs';

const UpcomingScreen = () => {
  const { tasks, toggleTask } = useTasks();
  const { colors, isDark } = useTheme();

  const today = dayjs();
  const allTasks = tasks.filter(t => !t.completed);

  const sections = [
    { 
      title: 'Today', 
      subtitle: today.format('ddd, MMM D'),
      icon: Sun,
      accent: colors.gold,
      data: allTasks.filter(t => t.dueDate && dayjs(t.dueDate).isSame(today, 'day')),
    },
    { 
      title: 'Tomorrow', 
      subtitle: today.add(1, 'day').format('ddd, MMM D'),
      icon: Sunrise,
      accent: colors.blue,
      data: allTasks.filter(t => t.dueDate && dayjs(t.dueDate).isSame(today.add(1, 'day'), 'day')),
    },
    { 
      title: 'Upcoming', 
      subtitle: 'Next 7 days',
      icon: Calendar,
      accent: colors.amber || colors.gold,
      data: allTasks.filter(t => t.dueDate && dayjs(t.dueDate).isAfter(today.add(1, 'day'), 'day') && dayjs(t.dueDate).isBefore(today.add(8, 'day'))),
    },
    { 
      title: 'Unscheduled', 
      subtitle: 'No date set',
      icon: Clock,
      accent: colors.textMuted,
      data: allTasks.filter(t => !t.dueDate),
    },
  ];

  const handleToggle = (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleTask(id);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'transparent' : colors.bgDeep }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textWhite }]}>Timeline</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>{today.format('MMMM YYYY')}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statPill, { backgroundColor: colors.gold + '15', borderColor: colors.gold + '25' }]}>
          <Text style={[styles.statNum, { color: colors.gold }]}>{allTasks.filter(t => t.dueDate).length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Scheduled</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: colors.blue + '15', borderColor: colors.blue + '25' }]}>
          <Text style={[styles.statNum, { color: colors.blue }]}>{allTasks.filter(t => !t.dueDate).length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Unplanned</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statNum, { color: colors.textWhite }]}>{allTasks.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <View key={section.title} style={styles.section}>
              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconCircle, { backgroundColor: section.accent + '15' }]}>
                  <Icon color={section.accent} size={16} />
                </View>
                <View>
                  <Text style={[styles.sectionLabel, { color: colors.textWhite }]}>{section.title}</Text>
                  <Text style={[styles.sectionSub, { color: colors.textMuted }]}>{section.subtitle}</Text>
                </View>
                <View style={[styles.sectionCount, { backgroundColor: section.accent + '15' }]}>
                  <Text style={[styles.sectionCountText, { color: section.accent }]}>{section.data.length}</Text>
                </View>
              </View>

              {section.data.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>No missions</Text>
                </View>
              ) : (
                section.data.map((task, idx) => (
                  <Pressable 
                    key={task.id} 
                    style={[styles.taskItem, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}
                    onPress={() => handleToggle(task.id)}
                  >
                    {/* Timeline dot + line */}
                    <View style={styles.timelineDot}>
                      <View style={[styles.dot, { backgroundColor: section.accent }]} />
                      {idx < section.data.length - 1 && <View style={[styles.line, { backgroundColor: colors.glassBorder }]} />}
                    </View>

                    <View style={[styles.checkbox, { borderColor: colors.checkboxBorder }]}>
                      <CheckCircle2 color={colors.checkboxBorder} size={14} />
                    </View>

                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskText, { color: colors.textWhite }]} numberOfLines={1}>{task.title}</Text>
                      <View style={styles.taskMeta}>
                        <Text style={[styles.projectTag, { color: section.accent }]}>#{task.project}</Text>
                        {task.dueDate && (
                          <View style={[styles.timeBadge, { backgroundColor: section.accent + '10' }]}>
                            <Bell color={section.accent} size={9} />
                            <Text style={[styles.timeText, { color: section.accent }]}>
                              {dayjs(task.dueDate).format('h:mm A')}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 64, paddingHorizontal: 24, marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 20, gap: 10 },
  statPill: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
  statNum: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  // Sections
  scroll: { paddingHorizontal: 24, paddingBottom: 180 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIconCircle: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  sectionLabel: { fontSize: 16, fontWeight: '700' },
  sectionSub: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  sectionCount: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  sectionCountText: { fontSize: 12, fontWeight: '800' },
  // Empty
  emptyCard: { padding: 20, borderRadius: 18, alignItems: 'center', borderWidth: 1 },
  emptyText: { fontSize: 13, fontStyle: 'italic' },
  // Tasks
  taskItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, marginBottom: 8, borderWidth: 1 },
  timelineDot: { alignItems: 'center', marginRight: 10, width: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  line: { width: 1, height: 30, marginTop: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  taskInfo: { flex: 1 },
  taskText: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  taskMeta: { flexDirection: 'row', alignItems: 'center' },
  projectTag: { fontSize: 10, fontWeight: '700' },
  timeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  timeText: { fontSize: 9, fontWeight: '700', marginLeft: 3 },
});

export default UpcomingScreen;
