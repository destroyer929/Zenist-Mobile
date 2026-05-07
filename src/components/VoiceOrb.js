import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable, Animated, Text, Modal, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Mic, Loader2, Sparkles, CheckCircle2, AudioLines } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { parseVoiceCommand } from '../utils/nlpParser';
import { nanoid } from 'nanoid/non-secure';

// ─── Simulation Overlay (unchanged) ─────────────────────────────
const SimulationOverlay = ({ intent, onComplete, colors, isDark }) => {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();

    const runSimulation = async () => {
      await new Promise(r => setTimeout(r, 600));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(1);
      
      await new Promise(r => setTimeout(r, 600));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(2);
      
      await new Promise(r => setTimeout(r, 600));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(3);
      
      await new Promise(r => setTimeout(r, 1200));
      
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        onComplete();
      });
    };
    runSimulation();
  }, []);

  const getSimContent = () => {
    switch (intent.action) {
      case 'CLEAR_ALL': return { title: "Authorizing Mass Deletion", step1Label: "Target", step1Val: "All Tasks", step2Label: "Action", step2Val: "Wipe DB", success: "Database Cleared" };
      case 'SEARCH': return { title: "Initializing Protocol", step1Label: "Query", step1Val: intent.query, step2Label: "Target", step2Val: "Local DB", success: "Search Executed" };
      case 'CHANGE_THEME': return { title: "Accessing System Appearance", step1Label: "Theme", step1Val: intent.theme, step2Label: "Mode", step2Val: "Global", success: "Appearance Updated" };
      case 'NAVIGATE': return { title: "Calculating Route", step1Label: "Destination", step1Val: intent.screen, step2Label: "Protocol", step2Val: "Fast Travel", success: "Arrived" };
      case 'UPDATE_TASK': return { title: "Synthesizing Intent", step1Label: "Task", step1Val: intent.title, step2Label: "Update", step2Val: intent.dueDate ? 'Alarm Set' : 'Subtasks Added', success: "Task Updated" };
      default: return { title: "Synthesizing Intent", step1Label: "Task", step1Val: intent.title, step2Label: "Workspace", step2Val: intent.project || 'Inbox', success: "Task Created" };
    }
  };
  const sim = getSimContent();

  return (
    <Modal transparent animationType="none" visible={true}>
      <Animated.View style={[styles.simOverlay, { opacity: fadeAnim }]}>
        <BlurView intensity={isDark ? 60 : 40} tint={isDark ? "dark" : "light"} style={styles.simBlur}>
          <Animated.View style={[
            styles.simCard, 
            { 
              backgroundColor: isDark ? 'rgba(25, 25, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <View style={styles.simIconWrapper}>
              <Sparkles color={colors.gold} size={32} />
            </View>
            
            <Text style={[styles.simTitle, { color: isDark ? '#fff' : '#000' }]}>
              {step === 0 ? sim.title + "..." : "Analysis Complete"}
            </Text>

            <View style={styles.simStepsContainer}>
              <View style={[styles.simRow, { opacity: step >= 1 ? 1 : 0 }]}>
                <Text style={[styles.simLabel, { color: colors.textMuted }]}>{sim.step1Label}</Text>
                <Text style={[styles.simValue, { color: isDark ? '#fff' : '#000' }]} numberOfLines={2}>{sim.step1Val}</Text>
              </View>

              <View style={[styles.simRow, { opacity: step >= 2 ? 1 : 0 }]}>
                <Text style={[styles.simLabel, { color: colors.textMuted }]}>{sim.step2Label}</Text>
                <View style={[styles.simChip, { backgroundColor: colors.gold + '20' }]}>
                  <Text style={[styles.simChipText, { color: colors.gold }]}>{sim.step2Val}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.simSuccessRow, { opacity: step >= 3 ? 1 : 0 }]}>
              <CheckCircle2 color="#4cd964" size={20} />
              <Text style={[styles.simSuccessText, { color: "#4cd964" }]}>{sim.success}</Text>
            </View>
          </Animated.View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
};

// ─── Main Voice Orb ─────────────────────────────────────────────
const VoiceOrb = () => {
  const navigation = useNavigation();
  const { colors, isDark, setThemeMode } = useTheme();
  const { tasks, addTask, toggleTask, deleteTask, updateTask, clearTasks } = useTasks();
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [transcript, setTranscript] = useState('');
  const [simulationIntent, setSimulationIntent] = useState(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const outerPulseAnim = useRef(new Animated.Value(1)).current;
  const backdropFade = useRef(new Animated.Value(0)).current;

  // ─── Speech Recognition Events ──────────────────────────────
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setTranscript('');
    setRecordingStatus('Listening...');
    startPulse();
  });

  useSpeechRecognitionEvent('result', (event) => {
    const currentTranscript = event.results[event.results.length - 1]?.transcript || '';
    setTranscript(currentTranscript);
    setRecordingStatus(currentTranscript || 'Listening...');
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    stopPulse();
    
    if (transcript && transcript.trim().length > 0) {
      setIsProcessing(true);
      setRecordingStatus('Processing...');
      
      // Use the local parser instead of LLM
      const intent = parseVoiceCommand(transcript, tasks);
      console.log('Local parser result:', JSON.stringify(intent, null, 2));
      
      if (intent && intent.action !== 'UNKNOWN') {
        executeIntent(intent);
      } else {
        Speech.speak(intent?.responseSpeech || "I didn't understand that.", { rate: 1.0, pitch: 1.0 });
        setRecordingStatus(intent?.responseSpeech || "I didn't understand.");
        setTimeout(() => setRecordingStatus(''), 3000);
      }
      
      setIsProcessing(false);
    } else {
      setRecordingStatus("I didn't catch that, try again.");
      Speech.speak("I didn't catch that, try again.", { rate: 1.0, pitch: 1.0 });
      setTimeout(() => setRecordingStatus(''), 3000);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.log('Speech recognition error:', event.error, event.message);
    setIsListening(false);
    stopPulse();
    setIsProcessing(false);
    
    if (event.error === 'no-speech') {
      setRecordingStatus("I didn't hear anything.");
      Speech.speak("I didn't hear anything, try again.", { rate: 1.0, pitch: 1.0 });
    } else {
      setRecordingStatus('Voice error. Try again.');
    }
    setTimeout(() => setRecordingStatus(''), 3000);
  });

  // ─── Animations ─────────────────────────────────────────────
  const startPulse = () => {
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(outerPulseAnim, { toValue: 2, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(outerPulseAnim, { toValue: 1, duration: 0, useNativeDriver: true })
        ])
      ),
      Animated.timing(backdropFade, { toValue: 1, duration: 300, useNativeDriver: true })
    ]).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    outerPulseAnim.stopAnimation();
    Animated.parallel([
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(outerPulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(backdropFade, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start();
  };

  // ─── Toggle Recording ───────────────────────────────────────
  const toggleRecording = async () => {
    if (isListening) {
      // Stop listening
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch (e) {
        console.log('Stop error:', e);
      }
    } else {
      // Start listening
      if (isProcessing) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        setRecordingStatus('Mic permission denied');
        Speech.speak("Microphone permission denied.", { rate: 1.0, pitch: 1.0 });
        setTimeout(() => setRecordingStatus(''), 2000);
        return;
      }

      try {
        ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: true,
          maxAlternatives: 1,
          requiresOnDeviceRecognition: false, // Falls back to cloud if on-device unavailable
          addsPunctuation: false,
        });
      } catch (err) {
        console.log('Start error:', err);
        setRecordingStatus('Speech recognition unavailable.');
        Speech.speak("Speech recognition is not available on this device.", { rate: 1.0, pitch: 1.0 });
        setTimeout(() => setRecordingStatus(''), 3000);
      }
    }
  };

  // ─── Execute Intent ─────────────────────────────────────────
  const executeIntent = (intent) => {
    // Actions that go through the SimulationOverlay
    const simulatedActions = ['ADD_TASK', 'UPDATE_TASK', 'CLEAR_ALL', 'SEARCH', 'CHANGE_THEME', 'NAVIGATE'];
    
    if (simulatedActions.includes(intent.action)) {
      if (intent.responseSpeech) {
        Speech.speak(intent.responseSpeech, { rate: 1.0, pitch: 1.0 });
      }
      setRecordingStatus('');
      setSimulationIntent(intent);
    } 
    // LIST actions — just speak, no state change
    else if (intent.action === 'LIST_TASKS' || intent.action === 'LIST_SUBTASKS') {
      if (intent.responseSpeech) {
        Speech.speak(intent.responseSpeech, { rate: 1.0, pitch: 1.0 });
      }
      setRecordingStatus(intent.responseSpeech || '');
      setTimeout(() => setRecordingStatus(''), 5000);
    }
    // TOGGLE / DELETE — immediate action
    else if (intent.action === 'TOGGLE_TASK' || intent.action === 'DELETE_TASK') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      let target = tasks.find(t => t.title.toLowerCase().includes(intent.title.toLowerCase()));
      
      if (target) {
        if (intent.action === 'TOGGLE_TASK') {
          if (intent.subtasks && intent.subtasks.length > 0) {
            const newSubtasks = [...(target.subtasks || [])];
            const uniqueSubtasks = [...new Set(intent.subtasks.map(s => s.toLowerCase().trim()))];
            
            uniqueSubtasks.forEach(subTitle => {
              const subIdx = newSubtasks.findIndex(s => s.title.toLowerCase().trim().includes(subTitle));
              if (subIdx > -1) {
                newSubtasks[subIdx] = { ...newSubtasks[subIdx], completed: !newSubtasks[subIdx].completed };
              }
            });

            const allDone = newSubtasks.length > 0 && newSubtasks.every(s => s.completed);
            updateTask(target.id, { 
              subtasks: newSubtasks, 
              completed: allDone,
              completedAt: allDone ? new Date().toISOString() : null 
            });
            
            if (intent.responseSpeech) Speech.speak(intent.responseSpeech, { rate: 1.0, pitch: 1.0 });
            setRecordingStatus(`✅ Updated subtasks for: ${target.title}${allDone ? ' (Task Done!)' : ''}`);
          } else {
            toggleTask(target.id);
            if (intent.responseSpeech) Speech.speak(intent.responseSpeech, { rate: 1.0, pitch: 1.0 });
            setRecordingStatus(`✅ Toggled: ${target.title}`);
          }
        }
        if (intent.action === 'DELETE_TASK') {
          deleteTask(target.id);
          if (intent.responseSpeech) Speech.speak(intent.responseSpeech, { rate: 1.0, pitch: 1.0 });
          setRecordingStatus(`🗑 Deleted: ${target.title}`);
        }
      } else if (intent.action === 'TOGGLE_TASK') {
        // Try to find a subtask globally
        let foundSubtask = false;
        for (const task of tasks) {
          if (task.subtasks) {
            const subIdx = task.subtasks.findIndex(s => s.title.toLowerCase().includes(intent.title.toLowerCase()));
            if (subIdx > -1) {
              const newSubtasks = [...task.subtasks];
              newSubtasks[subIdx] = { ...newSubtasks[subIdx], completed: !newSubtasks[subIdx].completed };
              updateTask(task.id, { subtasks: newSubtasks });
              
              if (intent.responseSpeech) Speech.speak(intent.responseSpeech, { rate: 1.0, pitch: 1.0 });
              setRecordingStatus(`✅ Toggled Subtask: ${newSubtasks[subIdx].title}`);
              foundSubtask = true;
              break;
            }
          }
        }
        
        if (!foundSubtask) {
          setRecordingStatus(`Could not find: ${intent.title}`);
          Speech.speak("Am sorry I couldn't find that task.", { rate: 1.0, pitch: 1.0 });
        }
      } else {
        setRecordingStatus(`Could not find: ${intent.title}`);
        Speech.speak("Am sorry I couldn't find that task.", { rate: 1.0, pitch: 1.0 });
      }
      setTimeout(() => setRecordingStatus(''), 3000);
    } else {
      setRecordingStatus(intent.responseSpeech || 'Command not recognized.');
      if (intent.responseSpeech) {
        Speech.speak(intent.responseSpeech, { rate: 1.0, pitch: 1.0 });
      }
      setTimeout(() => setRecordingStatus(''), 3000);
    }
  };

  // ─── Simulation Complete Handler ────────────────────────────
  const handleSimulationComplete = () => {
    let subtasks = [];
    if (simulationIntent.subtasks && Array.isArray(simulationIntent.subtasks)) {
      subtasks = simulationIntent.subtasks.map(s => ({
        id: nanoid(),
        title: typeof s === 'string' ? s : s.title || s,
        completed: false
      }));
    }

    if (simulationIntent.action === 'ADD_TASK') {
      addTask({
        title: simulationIntent.title,
        project: simulationIntent.project || 'Inbox',
        dueDate: simulationIntent.dueDate,
        subtasks: subtasks
      });
    } else if (simulationIntent.action === 'UPDATE_TASK') {
      const target = tasks.find(t => t.title.toLowerCase().includes(simulationIntent.title.toLowerCase()));
      if (target) {
        const updates = {};
        if (simulationIntent.dueDate) updates.dueDate = simulationIntent.dueDate;
        if (subtasks.length > 0) {
          updates.subtasks = [...(target.subtasks || []), ...subtasks];
        }
        updateTask(target.id, updates);
      }
    } else if (simulationIntent.action === 'CLEAR_ALL') {
      clearTasks();
    } else if (simulationIntent.action === 'SEARCH') {
      navigation.navigate('Search', { initialQuery: simulationIntent.query || '' });
    } else if (simulationIntent.action === 'CHANGE_THEME') {
      setThemeMode(simulationIntent.theme);
    } else if (simulationIntent.action === 'NAVIGATE') {
      let route = 'Home';
      if (simulationIntent.screen) {
        const sc = simulationIntent.screen.toLowerCase();
        if (sc.includes('project')) route = 'Projects';
        else if (sc.includes('timeline') || sc.includes('upcoming')) route = 'Timeline';
        else if (sc.includes('profile')) route = 'Profile';
        else if (sc.includes('search')) route = 'Search';
      }
      navigation.navigate(route);
    }
    setSimulationIntent(null);
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <>
      {simulationIntent && (
        <SimulationOverlay 
          intent={simulationIntent} 
          onComplete={handleSimulationComplete} 
          colors={colors} 
          isDark={isDark} 
        />
      )}
      <View style={styles.container} pointerEvents="box-none">
        
        {/* Dynamic Blobs for Premium Mesh Gradient */}
        <Animated.View style={[
          styles.blob, 
          { backgroundColor: '#ff3b30', top: '10%', left: '0%', transform: [{ scale: outerPulseAnim }, { translateX: outerPulseAnim.interpolate({ inputRange:[1,2], outputRange:[0, 80]}) }], opacity: backdropFade }
        ]} pointerEvents="none" />
        
        <Animated.View style={[
          styles.blob, 
          { backgroundColor: '#8a2be2', top: '40%', right: '-10%', transform: [{ scale: pulseAnim }, { translateY: outerPulseAnim.interpolate({ inputRange:[1,2], outputRange:[0, -100]}) }], opacity: backdropFade }
        ]} pointerEvents="none" />

        <Animated.View style={[
          styles.blob, 
          { backgroundColor: '#ff9500', bottom: '10%', left: '20%', transform: [{ scale: outerPulseAnim }, { translateY: pulseAnim.interpolate({ inputRange:[1,1.5], outputRange:[0, 60]}) }], opacity: backdropFade }
        ]} pointerEvents="none" />

        {/* Full Screen Blurred Backdrop during recording */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropFade }]} pointerEvents="none">
          <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)' }]} />
        </Animated.View>

        {/* Central Listening Text */}
        <Animated.View style={[styles.centerListeningContent, { opacity: backdropFade }]} pointerEvents="none">
          <AudioLines color={isListening ? '#ff3b30' : colors.gold} size={48} />
          <Text style={[styles.centerListeningText, { color: isDark ? '#fff' : '#000' }]}>
            {isListening ? "Listening..." : "Processing..."}
          </Text>
          <Text style={[styles.centerListeningSub, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
            {isListening ? (transcript || "Tap to send command") : "Analyzing your voice"}
          </Text>
        </Animated.View>

        {/* Status Toast */}
        {recordingStatus !== '' && !isListening && !isProcessing && (
          <Animated.View style={[styles.statusToast, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.8)' }]}>
            <BlurView intensity={20} tint="dark" style={styles.statusBlur}>
              <Text style={[styles.statusText, { color: isDark ? colors.textWhite : '#fff' }]}>{recordingStatus}</Text>
            </BlurView>
          </Animated.View>
        )}

        <View style={styles.orbContainer}>
          <Pressable onPress={toggleRecording} style={styles.orbWrapper}>
            {/* Outer Ripple */}
            <Animated.View style={[
              styles.glowLayer, 
              { 
                backgroundColor: isListening ? '#ff3b30' : colors.gold,
                transform: [{ scale: outerPulseAnim }],
                opacity: outerPulseAnim.interpolate({
                  inputRange: [1, 2],
                  outputRange: [isListening ? 0.4 : 0.2, 0]
                })
              }
            ]} />
            {/* Inner Glow */}
            <Animated.View style={[
              styles.glowLayer, 
              { 
                backgroundColor: isListening ? '#ff3b30' : colors.gold,
                transform: [{ scale: pulseAnim }],
                opacity: isListening ? 0.6 : 0.3
              }
            ]} />
            
            {/* Core Orb */}
            <View style={[
              styles.orb, 
              { backgroundColor: isListening ? '#ff3b30' : (isProcessing ? colors.gold : colors.cardBg),
                borderColor: isProcessing ? colors.gold : (isListening ? '#ff3b30' : colors.glassBorder),
                borderWidth: 1
              }
            ]}>
              {isProcessing ? (
                <Loader2 color={isDark ? colors.bgDeep : '#fff'} size={24} />
              ) : (
                <Mic color={isListening ? '#fff' : (isDark ? colors.textWhite : '#000')} size={24} />
              )}
            </View>
          </Pressable>
        </View>
      </View>
    </>
  );
};

// ─── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 1000 },
  orbContainer: { position: 'absolute', bottom: 110, right: 24, alignItems: 'center' },
  centerListeningContent: { position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  centerListeningText: { fontSize: 28, fontWeight: '800', marginTop: 24, letterSpacing: 0.5 },
  centerListeningSub: { fontSize: 16, fontWeight: '500', marginTop: 8, opacity: 0.8, textAlign: 'center', paddingHorizontal: 40 },
  blob: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.6, filter: [{ blur: 40 }] },
  statusToast: { position: 'absolute', bottom: 190, right: 24, borderRadius: 16, overflow: 'hidden', width: 200 },
  statusBlur: { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  statusText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  orbWrapper: { width: 64, height: 64, justifyContent: 'center', alignItems: 'center' },
  glowLayer: { position: 'absolute', width: 56, height: 56, borderRadius: 28 },
  orb: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 12 },
  simOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  simBlur: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  simCard: { width: '85%', borderRadius: 24, padding: 32, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 20 },
  simIconWrapper: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255, 215, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24, alignSelf: 'center' },
  simTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 32, letterSpacing: 0.5 },
  simStepsContainer: { gap: 20, marginBottom: 32 },
  simRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  simLabel: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  simValue: { fontSize: 16, fontWeight: '500', flex: 1, textAlign: 'right', marginLeft: 16 },
  simChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  simChipText: { fontSize: 13, fontWeight: '700' },
  simSuccessRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  simSuccessText: { fontSize: 16, fontWeight: '600' }
});

export default VoiceOrb;
