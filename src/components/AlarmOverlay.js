import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Modal, Vibration, Animated, Easing } from 'react-native';
import { Bell, X } from 'lucide-react-native';
import { COLORS } from '../theme/constants';
import dayjs from 'dayjs';

const AlarmOverlay = ({ visible, task, onDismiss }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (visible) {
      // Start continuous vibration
      const vibrationInterval = setInterval(() => {
        Vibration.vibrate([0, 400, 200, 400]);
      }, 1200);

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Pulse the bell icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Ring the bell (rotate left-right)
      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 150,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: -1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: 0,
            duration: 150,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      return () => {
        clearInterval(vibrationInterval);
        Vibration.cancel();
      };
    }
  }, [visible]);

  const handleDismiss = () => {
    Vibration.cancel();
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onDismiss());
  };

  if (!task) return null;

  const bellRotation = ringAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>  
        {/* Radial glow behind bell */}
        <Animated.View style={[styles.glowCircle, { opacity: glowAnim, transform: [{ scale: pulseAnim }] }]} />

        {/* Animated Bell */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }, { rotate: bellRotation }], marginBottom: 30 }}>
          <View style={styles.bellCircle}>
            <Bell color={COLORS.bgDeep} size={48} />
          </View>
        </Animated.View>

        {/* Mission Info */}
        <Text style={styles.alertLabel}>MISSION ALARM</Text>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskTime}>{dayjs(task.dueDate).format('h:mm A')}</Text>
        <Text style={styles.projectName}>#{task.project}</Text>

        {/* Dismiss Button */}
        <Pressable onPress={handleDismiss} style={styles.dismissBtn}>
          <View style={styles.dismissInner}>
            <X color={COLORS.bgDeep} size={20} />
            <Text style={styles.dismissText}>Dismiss</Text>
          </View>
        </Pressable>

        {/* Subtle instruction */}
        <Text style={styles.hint}>Vibrating until dismissed</Text>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 11, 15, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  glowCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(239, 176, 46, 0.15)',
  },
  bellCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  alertLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 4,
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textWhite,
    textAlign: 'center',
    marginBottom: 8,
  },
  taskTime: {
    fontSize: 48,
    fontWeight: '200',
    color: COLORS.textWhite,
    marginBottom: 8,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: 50,
  },
  dismissBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 16,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  dismissInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dismissText: {
    color: COLORS.bgDeep,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  hint: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    marginTop: 24,
    fontStyle: 'italic',
  },
});

export default AlarmOverlay;
