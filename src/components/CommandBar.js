import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput, Modal, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../theme/constants';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { parseTaskCommand } from '../utils/nlpParser';
import { Hash, ArrowUp, Plus, X, CheckCircle2, Circle, Bell, BellOff, Inbox, Briefcase, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AlarmPicker from './AlarmPicker';
import dayjs from 'dayjs';

const CommandBar = ({ visible, onClose, onSave, defaultProject }) => {
  const { colors, isDark } = useTheme();
  const { projects } = useTasks();
  const [text, setText] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subInput, setSubInput] = useState('');
  const [preview, setPreview] = useState(null);
  const [alarmDate, setAlarmDate] = useState(null);
  const [selectedProject, setSelectedProject] = useState(defaultProject || 'Inbox');
  const [showAlarmPicker, setShowAlarmPicker] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setText('');
      setSubtasks([]);
      setSubInput('');
      setPreview(null);
      setAlarmDate(null);
      setSelectedProject(defaultProject || 'Inbox');
    }
  }, [visible, defaultProject]);

  const handleChange = (val) => {
    setText(val);
    setPreview(parseTaskCommand(val));
  };

  const addSubtask = () => {
    if (subInput.trim()) {
      setSubtasks([...subtasks, { id: Date.now().toString(), title: subInput, completed: false }]);
      setSubInput('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleSubtask = (id) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getProjectIcon = (name, color, size = 14) => {
    if (name === 'Work') return <Briefcase color={color} size={size} />;
    if (name === 'Personal') return <User color={color} size={size} />;
    return <Inbox color={color} size={size} />;
  };

  const handleSubmit = () => {
    if (text.trim()) {
      const finalTask = {
        ...(preview || parseTaskCommand(text)),
        project: selectedProject,
        subtasks: subtasks,
        dueDate: alarmDate ? alarmDate.toISOString() : null,
      };
      onSave(finalTask);
      onClose();
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          </Pressable>
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.centerContainer}>
              <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={[styles.content, { backgroundColor: isDark ? 'rgba(20,21,28,0.98)' : 'rgba(255,255,255,0.98)' }]}>
                <View style={styles.inputRow}>
                  <TextInput
                    ref={inputRef}
                    style={[styles.input, { color: colors.textWhite }]}
                    placeholder="Sanctuary Mission..."
                    placeholderTextColor={colors.textMuted}
                    value={text}
                    onChangeText={handleChange}
                  />
                  <Pressable onPress={handleSubmit} style={[styles.sendButton, { backgroundColor: colors.gold }]}>
                    <ArrowUp color={isDark ? colors.bgDeep : '#fff'} size={20} />
                  </Pressable>
                </View>

                {/* Project Selector */}
                <View style={styles.projectRow}>
                  {projects.map(p => {
                    const isActive = selectedProject.toLowerCase() === p.name.toLowerCase();
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => { setSelectedProject(p.name); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                        style={[styles.projectChip, { backgroundColor: isActive ? p.color + '20' : colors.glass, borderColor: isActive ? p.color + '40' : colors.glassBorder }]}
                      >
                        {getProjectIcon(p.name, isActive ? p.color : colors.textMuted)}
                        <Text style={[styles.projectChipText, { color: isActive ? p.color : colors.textMuted }]}>{p.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Alarm Section */}
                <View style={styles.alarmSection}>
                  <Pressable 
                    onPress={() => setShowAlarmPicker(true)} 
                    style={[styles.alarmBtn, { backgroundColor: alarmDate ? colors.gold : colors.glass, borderColor: alarmDate ? colors.gold : colors.glassBorder }]}
                  >
                    <Bell color={alarmDate ? (isDark ? colors.bgDeep : '#fff') : colors.gold} size={16} />
                    <Text style={[styles.alarmBtnText, { color: alarmDate ? (isDark ? colors.bgDeep : '#fff') : colors.gold }]}>
                      {alarmDate ? dayjs(alarmDate).format('MMM D, h:mm A') : 'Set Alarm'}
                    </Text>
                  </Pressable>
                  {alarmDate && (
                    <Pressable onPress={() => setAlarmDate(null)} style={[styles.clearAlarm, { backgroundColor: colors.glass }]}>
                      <X color={colors.textMuted} size={14} />
                    </Pressable>
                  )}
                </View>

                <View style={styles.subtaskSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionLabel, { color: colors.gold }]}>Action Plan</Text>
                    {subtasks.length > 0 && (
                      <Text style={[styles.countBadge, { color: colors.textMuted, backgroundColor: colors.glass }]}>{subtasks.length} steps</Text>
                    )}
                  </View>
                  
                  <ScrollView style={styles.subScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {subtasks.map(s => (
                      <View key={s.id} style={[styles.checkItem, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
                        <Pressable onPress={() => toggleSubtask(s.id)} style={styles.checkAction}>
                          {s.completed ? 
                            <CheckCircle2 color={colors.gold} size={18} /> : 
                            <Circle color={colors.textMuted} size={18} />
                          }
                        </Pressable>
                        <Text style={[styles.checkText, { color: colors.textWhite }, s.completed && styles.completedText]}>{s.title}</Text>
                        <Pressable onPress={() => setSubtasks(subtasks.filter(st => st.id !== s.id))} style={styles.deleteAction}>
                          <X color={colors.textMuted} size={14} />
                        </Pressable>
                      </View>
                    ))}
                    
                    <View style={styles.subInputWrapper}>
                      <View style={[styles.subInputRow, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Plus color={colors.gold} size={16} />
                        <TextInput
                          style={[styles.subInput, { color: colors.textWhite }]}
                          placeholder="Add step..."
                          placeholderTextColor={colors.textMuted}
                          value={subInput}
                          onChangeText={setSubInput}
                          onSubmitEditing={addSubtask}
                          blurOnSubmit={false}
                        />
                        {subInput.length > 0 && (
                          <Pressable onPress={addSubtask} style={[styles.addStepBtn, { backgroundColor: colors.gold }]}>
                            <ArrowUp color={isDark ? colors.bgDeep : '#fff'} size={14} />
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </ScrollView>
                </View>


              </BlurView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <AlarmPicker
        visible={showAlarmPicker}
        initialDate={alarmDate}
        onClose={() => setShowAlarmPicker(false)}
        onConfirm={(date) => {
          setAlarmDate(date);
          setShowAlarmPicker(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10,11,15,0.98)' },
  keyboardView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerContainer: { width: '92%', maxWidth: 400 },
  content: { borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  input: { flex: 1, fontSize: 20, paddingVertical: 10, fontWeight: '700' },
  sendButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  projectRow: { flexDirection: 'row', marginBottom: 14, gap: 8 },
  projectChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1, gap: 6 },
  projectChipText: { fontSize: 12, fontWeight: '700' },
  alarmSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  alarmBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, flex: 1, borderWidth: 1 },
  alarmBtnText: { fontSize: 13, fontWeight: '700', marginLeft: 10 },
  clearAlarm: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  subtaskSection: { marginTop: 10, maxHeight: 300 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
  countBadge: { fontSize: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  subScroll: { width: '100%' },
  checkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, marginBottom: 8, borderWidth: 1 },
  checkAction: { marginRight: 12 },
  checkText: { flex: 1, fontSize: 14, fontWeight: '500' },
  completedText: { textDecorationLine: 'line-through', opacity: 0.4 },
  deleteAction: { marginLeft: 10 },
  subInputWrapper: { marginTop: 4 },
  subInputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, height: 48, borderStyle: 'dashed', borderWidth: 1 },
  subInput: { flex: 1, fontSize: 14, marginLeft: 12 },
  addStepBtn: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  previewRow: { flexDirection: 'row', marginTop: 20, paddingTop: 16, borderTopWidth: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  chipText: { fontSize: 11, marginLeft: 4, fontWeight: '600' },
});

export default CommandBar;
