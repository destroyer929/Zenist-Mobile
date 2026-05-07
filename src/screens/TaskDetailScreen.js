import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Pressable, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { X, Hash, CheckCircle2, Plus, Trash2, Bell, BellOff, Clock, Inbox, Briefcase, User } from 'lucide-react-native';
import dayjs from 'dayjs';
import AlarmPicker from '../components/AlarmPicker';

const TaskDetailScreen = ({ visible, task, onClose }) => {
  const { updateTask, deleteTask, projects } = useTasks();
  const { colors, isDark } = useTheme();
  const [subtaskInput, setSubtaskInput] = useState('');
  const [showAlarmPicker, setShowAlarmPicker] = useState(false);

  if (!task) return null;

  const handleUpdate = (updates) => updateTask(task.id, updates);

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      const newSubtasks = [...(task.subtasks || []), { id: Date.now().toString(), title: subtaskInput, completed: false }];
      handleUpdate({ subtasks: newSubtasks });
      setSubtaskInput('');
    }
  };

  const toggleSubtask = (sId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSubtasks = task.subtasks.map(s => s.id === sId ? { ...s, completed: !s.completed } : s);
    handleUpdate({ subtasks: newSubtasks });
  };

  const calculateProgress = () => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(s => s.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const progress = calculateProgress();
  const hasAlarm = !!task.dueDate;
  const alarmIsFuture = hasAlarm && new Date(task.dueDate) > new Date();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(10,11,15,0.98)' : 'rgba(240,242,245,0.98)' }]}>
        <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={onClose}><X color={colors.textWhite} size={24} /></Pressable>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressText, { color: colors.gold }]}>{progress}% COMPLETE</Text>
              <View style={[styles.progressBarBase, { backgroundColor: colors.glass }]}>
                <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: colors.gold }]} />
              </View>
            </View>
            <Pressable onPress={() => { deleteTask(task.id); onClose(); }}>
              <Trash2 color="#ff4444" size={20} />
            </Pressable>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TextInput
                style={[styles.titleInput, { color: colors.textWhite }]}
                value={task.title}
                onChangeText={(v) => handleUpdate({ title: v })}
                multiline
                placeholder="Mission Name"
                placeholderTextColor={colors.textMuted}
              />

              <View style={styles.metaRow}>
                <View style={[styles.metaChip, { backgroundColor: colors.glass }]}>
                  <Hash color={colors.gold} size={16} />
                  <Text style={[styles.metaText, { color: colors.textWhite }]}>{task.project}</Text>
                </View>
              </View>

              {/* Project Selector */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.gold }]}>Project</Text>
                <View style={styles.projectRow}>
                  {projects.map(p => {
                    const isActive = task.project?.toLowerCase() === p.name.toLowerCase();
                    const Icon = p.name === 'Work' ? Briefcase : p.name === 'Personal' ? User : Inbox;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => { handleUpdate({ project: p.name }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                        style={[styles.projectChip, { backgroundColor: isActive ? p.color + '20' : colors.glass, borderColor: isActive ? p.color + '40' : colors.glassBorder }]}
                      >
                        <Icon color={isActive ? p.color : colors.textMuted} size={15} />
                        <Text style={[styles.projectChipText, { color: isActive ? p.color : colors.textMuted }]}>{p.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Reminder Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.gold }]}>Reminder</Text>
                
                {alarmIsFuture ? (
                  <View style={[styles.alarmCard, { backgroundColor: colors.gold + '15', borderColor: colors.gold + '30' }]}>
                    <View style={styles.alarmCardLeft}>
                      <View style={[styles.alarmIconCircle, { backgroundColor: colors.gold }]}>
                        <Bell color={isDark ? colors.bgDeep : '#fff'} size={18} />
                      </View>
                      <View style={styles.alarmInfo}>
                        <Text style={[styles.alarmTime, { color: colors.textWhite }]}>
                          {dayjs(task.dueDate).format('h:mm A')}
                        </Text>
                        <Text style={[styles.alarmDate, { color: colors.textMuted }]}>
                          {dayjs(task.dueDate).format('dddd, MMM D')}
                        </Text>
                      </View>
                    </View>
                    <Pressable 
                      onPress={() => handleUpdate({ dueDate: null })}
                      style={[styles.alarmClearBtn, { backgroundColor: colors.glass }]}
                    >
                      <BellOff color={colors.textMuted} size={16} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable 
                    onPress={() => setShowAlarmPicker(true)}
                    style={[styles.setAlarmBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                  >
                    <Clock color={colors.textMuted} size={18} />
                    <Text style={[styles.setAlarmText, { color: colors.textMuted }]}>Set a reminder</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.gold }]}>Action Plan</Text>
                <View style={styles.subList}>
                  {task.subtasks?.map(sub => (
                    <Pressable key={sub.id} style={[styles.subItem, { backgroundColor: colors.cardBg }]} onPress={() => toggleSubtask(sub.id)}>
                      <CheckCircle2 color={sub.completed ? colors.gold : colors.textMuted} size={18} />
                      <Text style={[styles.subLabel, { color: colors.textWhite }, sub.completed && styles.completedText]}>{sub.title}</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={[styles.addSubBox, { backgroundColor: colors.glass }]}>
                  <TextInput
                    style={[styles.subInput, { color: colors.textWhite }]}
                    placeholder="Add step..."
                    placeholderTextColor={colors.textMuted}
                    value={subtaskInput}
                    onChangeText={setSubtaskInput}
                    onSubmitEditing={addSubtask}
                    blurOnSubmit={false}
                  />
                  <Pressable style={[styles.addBtn, { backgroundColor: colors.gold }]} onPress={addSubtask}>
                    <Plus color={isDark ? colors.bgDeep : '#fff'} size={18} />
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </BlurView>
      </View>

      <AlarmPicker
        visible={showAlarmPicker}
        initialDate={task.dueDate}
        onClose={() => setShowAlarmPicker(false)}
        onConfirm={(date) => {
          handleUpdate({ dueDate: date.toISOString() });
          setShowAlarmPicker(false);
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  container: { flex: 1, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, height: 80 },
  progressHeader: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
  progressText: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  progressBarBase: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  scroll: { paddingHorizontal: 24, paddingBottom: 100 },
  titleInput: { fontSize: 32, fontWeight: '700', marginTop: 20, marginBottom: 20 },
  metaRow: { flexDirection: 'row', marginBottom: 10 },
  metaChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginRight: 8 },
  metaText: { marginLeft: 8, fontSize: 12, fontWeight: '600' },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },
  projectRow: { flexDirection: 'row', gap: 8 },
  projectChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 14, borderWidth: 1, gap: 8 },
  projectChipText: { fontSize: 13, fontWeight: '700' },
  alarmCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 1 },
  alarmCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  alarmIconCircle: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  alarmInfo: { marginLeft: 14 },
  alarmTime: { fontSize: 20, fontWeight: '700' },
  alarmDate: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  alarmClearBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  setAlarmBtn: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed' },
  setAlarmText: { fontSize: 15, fontWeight: '600', marginLeft: 14 },
  subList: { marginBottom: 10 },
  subItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 8 },
  subLabel: { marginLeft: 12, fontSize: 16, fontWeight: '500' },
  completedText: { textDecorationLine: 'line-through', opacity: 0.4 },
  addSubBox: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 8, borderRadius: 16, height: 56 },
  subInput: { flex: 1, fontSize: 16 },
  addBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});

export default TaskDetailScreen;
