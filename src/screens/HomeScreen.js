import React, { useState, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import BentoCard from '../components/BentoCard';
import CommandBar from '../components/CommandBar';
import FocusMode from '../components/FocusMode';
import AlarmOverlay from '../components/AlarmOverlay';
import VoiceOrb from '../components/VoiceOrb';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import { GREETINGS } from '../theme/constants';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { CheckCircle2, Flame, Plus, Bell, Target, TrendingUp } from 'lucide-react-native';
import dayjs from 'dayjs';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { timeMode, colors, isDark } = useTheme();
  const { tasks, addTask, toggleTask, updateTask } = useTasks();
  const [isCommandBarVisible, setCommandBarVisible] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [alarmTask, setAlarmTask] = useState(null);
  const firedAlarms = useRef(new Set());

  const completedCount = tasks.filter(t => t.completed).length;
  const activeCount = tasks.filter(t => !t.completed).length;
  const todayCount = tasks.length;
  const progress = todayCount > 0 ? Math.round((completedCount / todayCount) * 100) : 0;

  const editingTask = useMemo(() => tasks.find(t => t.id === editingTaskId), [tasks, editingTaskId]);
  const focusedTask = useMemo(() => tasks.find(t => t.id === focusedTaskId), [tasks, focusedTaskId]);

  // In-App Alarm Engine
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date().getTime();
      tasks.forEach(task => {
        if (task.dueDate && !task.completed) {
          const alarmTime = new Date(task.dueDate).getTime();
          const diff = now - alarmTime;
          if (diff < 0) { firedAlarms.current.delete(task.id); return; }
          if (diff >= 0 && diff < 120000 && !firedAlarms.current.has(task.id)) {
            firedAlarms.current.add(task.id);
            setAlarmTask(task);
          }
          if (diff >= 120000) firedAlarms.current.add(task.id);
        }
      });
    };
    checkAlarms();
    const interval = setInterval(checkAlarms, 5000);
    return () => clearInterval(interval);
  }, [tasks]);

  const handleToggle = (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleTask(id);
  };

  const handleOpenAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCommandBarVisible(true);
  };

  const calculateTaskProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(s => s.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const getTimeEmoji = () => {
    switch (timeMode) {
      case 'morning': return '☀️';
      case 'afternoon': return '🌤';
      case 'evening': return '🌅';
      case 'night': return '🌙';
      default: return '✨';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Premium Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.timeEmoji]}>{getTimeEmoji()}</Text>
            <View>
              <Text style={[styles.greeting, { color: colors.textMuted }]}>{GREETINGS[timeMode]}</Text>
              <Text style={[styles.userName, { color: colors.textWhite }]}>Karunakar</Text>
            </View>
          </View>
          <Pressable onPress={handleOpenAdd} style={[styles.addButton]}>
            <LinearGradient
              colors={[colors.gold, colors.amber || colors.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonGradient}
            >
              <Plus color={isDark ? colors.bgDeep : '#fff'} size={22} strokeWidth={3} />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={styles.grid}>
          <BentoCard title="Mission Status" span={2} height={140} delay={100}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <View style={[styles.statusIcon, { backgroundColor: colors.gold + '15' }]}>
                  <Target color={colors.gold} size={20} />
                </View>
                <Text style={[styles.statusNum, { color: colors.textWhite }]}>{activeCount}</Text>
                <Text style={[styles.statusLabel, { color: colors.textMuted }]}>Active</Text>
              </View>
              <View style={[styles.statusDivider, { backgroundColor: colors.glassBorder }]} />
              <View style={styles.statusItem}>
                <View style={[styles.statusIcon, { backgroundColor: colors.gold + '15' }]}>
                  <Flame color={colors.gold} size={20} />
                </View>
                <Text style={[styles.statusNum, { color: colors.textWhite }]}>{completedCount}</Text>
                <Text style={[styles.statusLabel, { color: colors.textMuted }]}>Done</Text>
              </View>
              <View style={[styles.statusDivider, { backgroundColor: colors.glassBorder }]} />
              <View style={styles.statusItem}>
                <View style={[styles.statusIcon, { backgroundColor: colors.blue + '15' }]}>
                  <TrendingUp color={colors.blue} size={20} />
                </View>
                <Text style={[styles.statusNum, { color: colors.textWhite }]}>{progress}%</Text>
                <Text style={[styles.statusLabel, { color: colors.textMuted }]}>Progress</Text>
              </View>
            </View>
          </BentoCard>

          {/* Progress Bar Card */}
          <BentoCard title="Today's Flow" span={2} height={90} delay={200}>
            <View style={styles.progressSection}>
              <View style={[styles.progressTrack, { backgroundColor: colors.glass }]}>
                <LinearGradient
                  colors={[colors.gold, colors.amber || colors.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${Math.max(progress, 2)}%` }]}
                />
              </View>
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                {activeCount > 0 ? `${activeCount} missions remaining` : 'All missions complete 🎯'}
              </Text>
            </View>
          </BentoCard>

          {/* Deep Work Card */}
          <BentoCard title="Deep Work" span={2} height={tasks.length === 0 ? 140 : Math.min(80 + tasks.slice(-6).length * 72, 520)} delay={300}>
            {tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyEmoji]}>🧘</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Your sanctuary is clear</Text>
                <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Tap + to begin a new mission</Text>
              </View>
            ) : (
              tasks.slice(-6).reverse().map((task, index) => {
                const taskProgress = calculateTaskProgress(task);
                const hasAlarm = task.dueDate && new Date(task.dueDate) > new Date();
                return (
                  <Pressable
                    key={task.id}
                    onPress={() => setEditingTaskId(task.id)}
                    onLongPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                      setFocusedTaskId(task.id);
                    }}
                    style={[styles.taskItem, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}
                  >
                    <Pressable
                      onPress={() => handleToggle(task.id)}
                      style={[styles.checkbox, { borderColor: colors.checkboxBorder }, task.completed && { backgroundColor: colors.gold, borderColor: colors.gold }]}
                    >
                      {task.completed && <CheckCircle2 color={isDark ? colors.bgDeep : '#fff'} size={14} />}
                    </Pressable>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskText, { color: colors.textWhite }, task.completed && styles.completedText]} numberOfLines={1}>
                        {task.title}
                      </Text>
                      <View style={styles.taskMeta}>
                        <Text style={[styles.projectTag, { color: colors.gold }]}>#{task.project}</Text>
                        {hasAlarm && !task.completed && (
                          <View style={[styles.alarmBadge, { backgroundColor: colors.gold + '15' }]}>
                            <Bell color={colors.gold} size={10} />
                            <Text style={[styles.alarmBadgeText, { color: colors.gold }]}>
                              {dayjs(task.dueDate).format('h:mm A')}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {taskProgress !== null && !task.completed && (
                      <View style={[styles.taskProgressBadge, { backgroundColor: colors.gold + '15' }]}>
                        <Text style={[styles.taskProgressText, { color: colors.gold }]}>{taskProgress}%</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })
            )}
          </BentoCard>
        </View>
      </ScrollView>

      <VoiceOrb />
      <CommandBar visible={isCommandBarVisible} onClose={() => setCommandBarVisible(false)} onSave={addTask} />
      <FocusMode visible={!!focusedTask} task={focusedTask} onClose={() => setFocusedTaskId(null)} onComplete={handleToggle} />
      <TaskDetailScreen visible={!!editingTask} task={editingTask} onClose={() => setEditingTaskId(null)} />
      <AlarmOverlay
        visible={!!alarmTask}
        task={alarmTask}
        onDismiss={() => {
          if (alarmTask) updateTask(alarmTask.id, { dueDate: null });
          setAlarmTask(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 180 },
  // Header
  header: { paddingHorizontal: 24, paddingTop: 64, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  timeEmoji: { fontSize: 36, marginRight: 14 },
  greeting: { fontSize: 14, fontWeight: '500' },
  userName: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  addButton: { shadowColor: '#efb02e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  addButtonGradient: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  // Status Row
  statusRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statusItem: { alignItems: 'center', flex: 1 },
  statusIcon: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8, marginTop: 8 },
  statusNum: { fontSize: 22, fontWeight: '800' },
  statusLabel: { fontSize: 10, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  statusDivider: { width: 1, height: 50, opacity: 0.5 },
  // Progress
  progressSection: { flex: 1, justifyContent: 'center' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 10, marginTop: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabel: { fontSize: 12, fontWeight: '600' },
  // Task Items
  taskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 18, marginBottom: 8, borderWidth: 1 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  taskInfo: { flex: 1, marginLeft: 14 },
  taskText: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  taskMeta: { flexDirection: 'row', alignItems: 'center' },
  projectTag: { fontSize: 11, fontWeight: '700' },
  alarmBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  alarmBadgeText: { fontSize: 9, fontWeight: '700', marginLeft: 3 },
  taskProgressBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  taskProgressText: { fontSize: 11, fontWeight: '800' },
  completedText: { textDecorationLine: 'line-through', opacity: 0.35 },
  // Empty
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  emptyHint: { fontSize: 12, marginTop: 4, opacity: 0.6 },
});

export default HomeScreen;
