import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

const BentoCard = ({ title, children, style, height = 160, span = 1, delay = 0 }) => {
  const { colors, isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 18,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 18,
        friction: 8,
        delay,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      styles.container, 
      { height }, 
      span === 2 ? styles.span2 : styles.span1,
      style,
      { opacity, transform: [{ translateY }, { scale }] }
    ]}>
      <BlurView intensity={isDark ? 25 : 10} tint={isDark ? 'dark' : 'light'} style={[styles.glass, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        {/* Inner top edge highlight */}
        <View style={[styles.edgeHighlight, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)' }]} />
        <View style={styles.inner}>
          {title && (
            <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
          )}
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 6,
  },
  span1: {
    width: '50%',
  },
  span2: {
    width: '100%',
  },
  glass: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  edgeHighlight: {
    height: 1,
    marginHorizontal: 16,
    marginTop: 1,
    borderRadius: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.7,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  content: {
    flex: 1,
  },
});

export default BentoCard;
