import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../theme/constants';
import { X, Play, Pause, CheckCircle } from 'lucide-react-native';

const FocusMode = ({ visible, task, onClose, onComplete }) => {
  const [seconds, setSeconds] = useState(1500); // 25 mins
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!task) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <BlurView intensity={90} tint="dark" style={styles.container}>
        <Pressable style={styles.close} onPress={onClose}>
          <X color={COLORS.textWhite} size={24} />
        </Pressable>

        <View style={styles.content}>
          <Text style={styles.projectLabel}>#{task.project}</Text>
          <Text style={styles.taskTitle}>{task.title}</Text>
          
          <View style={styles.timerBox}>
            <Text style={styles.timer}>{formatTime(seconds)}</Text>
          </View>

          <View style={styles.controls}>
            <Pressable 
              style={[styles.btn, isActive ? styles.pauseBtn : styles.playBtn]} 
              onPress={() => setIsActive(!isActive)}
            >
              {isActive ? <Pause color={COLORS.textWhite} size={32} /> : <Play color={COLORS.bgDeep} size={32} />}
            </Pressable>

            <Pressable 
              style={[styles.btn, styles.completeBtn]} 
              onPress={() => {
                onComplete(task.id);
                onClose();
              }}
            >
              <CheckCircle color={COLORS.textWhite} size={32} />
            </Pressable>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  close: {
    position: 'absolute',
    top: 60,
    right: 30,
    padding: 10,
  },
  content: {
    alignItems: 'center',
    padding: 40,
    width: '100%',
  },
  projectLabel: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 20,
  },
  taskTitle: {
    color: COLORS.textWhite,
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 42,
  },
  timerBox: {
    marginTop: 60,
    marginBottom: 60,
  },
  timer: {
    color: COLORS.textWhite,
    fontSize: 80,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  playBtn: {
    backgroundColor: COLORS.gold,
  },
  pauseBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  completeBtn: {
    backgroundColor: COLORS.blue,
  }
});

export default FocusMode;
