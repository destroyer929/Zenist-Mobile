import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { Briefcase, User, Inbox, ChevronRight, ChevronLeft, CheckCircle2, Folder, Target, Plus } from 'lucide-react-native';
import CommandBar from '../components/CommandBar';

const ProjectsScreen = () => {
  const { projects, tasks, toggleTask, addTask } = useTasks();
  const { colors, isDark } = useTheme();
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCommandBar, setShowCommandBar] = useState(false);

  const getIcon = (name, color, size = 22) => {
    if (name === 'Work') return <Briefcase color={color} size={size} />;
    if (name === 'Personal') return <User color={color} size={size} />;
    return <Inbox color={color} size={size} />;
  };

  const filteredTasks = selectedProject 
    ? tasks.filter(t => t.project.toLowerCase() === selectedProject.toLowerCase())
    : [];

  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const handleToggle = (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggleTask(id);
  };

  const totalActive = tasks.filter(t => !t.completed).length;
  const totalCompleted = tasks.filter(t => t.completed).length;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'transparent' : colors.bgDeep }]}>
      <View style={styles.header}>
        {selectedProject ? (
          <View style={styles.headerRow}>
            <Pressable onPress={() => setSelectedProject(null)} style={[styles.backBtn, { backgroundColor: colors.glass }]}>
              <ChevronLeft color={colors.gold} size={20} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: colors.textWhite }]}>{selectedProject}</Text>
              <Text style={[styles.headerSub, { color: colors.textMuted }]}>{activeTasks.length} active · {completedTasks.length} done</Text>
            </View>
            <Pressable 
              onPress={() => { setShowCommandBar(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
              style={[styles.addBtnSmall, { backgroundColor: colors.gold }]}
            >
              <Plus color={isDark ? colors.bgDeep : '#fff'} size={18} />
            </Pressable>
          </View>
        ) : (
          <View>
            <Text style={[styles.headerTitle, { color: colors.textWhite }]}>Projects</Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>{projects.length} workspaces</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!selectedProject ? (
          <>
            {/* Overview Stats */}
            <View style={styles.overviewRow}>
              <View style={[styles.overviewCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
                <View style={[styles.overviewIcon, { backgroundColor: colors.gold + '15' }]}>
                  <Target color={colors.gold} size={18} />
                </View>
                <Text style={[styles.overviewNum, { color: colors.textWhite }]}>{totalActive}</Text>
                <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Active</Text>
              </View>
              <View style={[styles.overviewCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
                <View style={[styles.overviewIcon, { backgroundColor: colors.blue + '15' }]}>
                  <CheckCircle2 color={colors.blue} size={18} />
                </View>
                <Text style={[styles.overviewNum, { color: colors.textWhite }]}>{totalCompleted}</Text>
                <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Done</Text>
              </View>
              <View style={[styles.overviewCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
                <View style={[styles.overviewIcon, { backgroundColor: colors.glass }]}>
                  <Folder color={colors.textMuted} size={18} />
                </View>
                <Text style={[styles.overviewNum, { color: colors.textWhite }]}>{projects.length}</Text>
                <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Projects</Text>
              </View>
            </View>

            {/* Project Cards */}
            <Text style={[styles.sectionTitle, { color: colors.gold }]}>Workspaces</Text>
            {projects.map((project) => {
              const projectTasks = tasks.filter(t => t.project.toLowerCase() === project.name.toLowerCase());
              const activeCount = projectTasks.filter(t => !t.completed).length;
              const doneCount = projectTasks.filter(t => t.completed).length;
              const total = projectTasks.length;
              const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

              return (
                <Pressable 
                  key={project.id} 
                  style={[styles.projectCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}
                  onPress={() => { setSelectedProject(project.name); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <View style={[styles.projectIcon, { backgroundColor: project.color + '15' }]}>
                    {getIcon(project.name, project.color)}
                  </View>
                  <View style={styles.projectInfo}>
                    <Text style={[styles.projectName, { color: colors.textWhite }]}>{project.name}</Text>
                    <View style={styles.projectMeta}>
                      <Text style={[styles.projectCount, { color: colors.textMuted }]}>{activeCount} active</Text>
                      {progress > 0 && (
                        <View style={[styles.progressPill, { backgroundColor: project.color + '15' }]}>
                          <Text style={[styles.progressPillText, { color: project.color }]}>{progress}%</Text>
                        </View>
                      )}
                    </View>
                    {/* Mini progress bar */}
                    <View style={[styles.miniProgressTrack, { backgroundColor: colors.glass }]}>
                      <View style={[styles.miniProgressFill, { width: `${Math.max(progress, 2)}%`, backgroundColor: project.color }]} />
                    </View>
                  </View>
                  <ChevronRight color={colors.textMuted} size={18} />
                </Pressable>
              );
            })}
          </>
        ) : (
          <>
            {/* Progress Card */}
            {filteredTasks.length > 0 && (
              <View style={[styles.progressCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
                <View style={styles.progressInfo}>
                  <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Completion</Text>
                  <Text style={[styles.progressValue, { color: colors.textWhite }]}>
                    {filteredTasks.length > 0 ? Math.round((completedTasks.length / filteredTasks.length) * 100) : 0}%
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.glass }]}>
                  <LinearGradient
                    colors={[colors.gold, colors.amber || colors.gold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${filteredTasks.length > 0 ? Math.max(Math.round((completedTasks.length / filteredTasks.length) * 100), 2) : 2}%` }]}
                  />
                </View>
              </View>
            )}

            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={[styles.sectionTitle, { color: colors.gold }]}>Active</Text>
                {activeTasks.map(task => (
                  <Pressable 
                    key={task.id} 
                    onPress={() => handleToggle(task.id)}
                    style={[styles.taskItem, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}
                  >
                    <View style={[styles.checkbox, { borderColor: colors.checkboxBorder }]} />
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskText, { color: colors.textWhite }]} numberOfLines={1}>{task.title}</Text>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <Text style={[styles.subCount, { color: colors.textMuted }]}>
                          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} steps
                        </Text>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Completed</Text>
                {completedTasks.map(task => (
                  <Pressable 
                    key={task.id} 
                    onPress={() => handleToggle(task.id)}
                    style={[styles.taskItem, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}
                  >
                    <View style={[styles.checkbox, { backgroundColor: colors.gold, borderColor: colors.gold }]}>
                      <CheckCircle2 color={isDark ? colors.bgDeep : '#fff'} size={13} />
                    </View>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskText, styles.completedText, { color: colors.textWhite }]} numberOfLines={1}>{task.title}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {filteredTasks.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📂</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No missions in this project yet</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <CommandBar 
        visible={showCommandBar} 
        onClose={() => setShowCommandBar(false)} 
        onSave={addTask}
        defaultProject={selectedProject || 'Inbox'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 64, paddingHorizontal: 24, marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  addBtnSmall: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  scroll: { paddingHorizontal: 24, paddingBottom: 180 },
  // Overview
  overviewRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  overviewCard: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1 },
  overviewIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  overviewNum: { fontSize: 22, fontWeight: '800' },
  overviewLabel: { fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  // Sections
  sectionTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 14, marginLeft: 4 },
  // Project Cards
  projectCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 22, marginBottom: 10, borderWidth: 1 },
  projectIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  projectInfo: { flex: 1 },
  projectName: { fontSize: 17, fontWeight: '700' },
  projectMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  projectCount: { fontSize: 12, fontWeight: '500' },
  progressPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  progressPillText: { fontSize: 10, fontWeight: '800' },
  miniProgressTrack: { height: 3, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  miniProgressFill: { height: '100%', borderRadius: 2 },
  // Progress Card
  progressCard: { padding: 18, borderRadius: 20, marginBottom: 24, borderWidth: 1 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel: { fontSize: 12, fontWeight: '600' },
  progressValue: { fontSize: 18, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  // Tasks
  taskSection: { marginBottom: 24 },
  taskItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, marginBottom: 8, borderWidth: 1 },
  checkbox: { width: 22, height: 22, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  taskInfo: { flex: 1 },
  taskText: { fontSize: 15, fontWeight: '600' },
  subCount: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  completedText: { textDecorationLine: 'line-through', opacity: 0.35 },
  // Empty
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, fontStyle: 'italic' },
});

export default ProjectsScreen;
