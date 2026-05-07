import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const Backdrop = () => {
  const { timeMode, colors, isDark } = useTheme();

  if (!isDark) return null;

  const getGlow = () => {
    switch (timeMode) {
      case 'morning': return ['#efb02e', '#e67e22'];
      case 'afternoon': return ['#3498db', '#2980b9'];
      case 'evening': return ['#e67e22', '#d35400'];
      case 'night': return ['#2c3e50', '#1a252f'];
      default: return ['#3498db', '#2980b9'];
    }
  };

  const glow = getGlow();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.bgDeep, colors.bgPrimary]}
        style={StyleSheet.absoluteFill}
      />
      {/* Top-right ambient glow */}
      <LinearGradient
        colors={[glow[0] + '18', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Bottom-left subtle glow */}
      <LinearGradient
        colors={['transparent', glow[1] + '08']}
        start={{ x: 0, y: 0.6 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Top edge highlight line */}
      <LinearGradient
        colors={[glow[0] + '30', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.15 }}
        style={[StyleSheet.absoluteFill, { height: height * 0.15 }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default Backdrop;
