import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { DARK_COLORS, LIGHT_COLORS } from '../theme/constants';

const ThemeContext = createContext();
const THEME_FILE = `${FileSystem.documentDirectory}zenist_theme.json`;

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark'
  const [timeMode, setTimeMode] = useState('afternoon');
  const [themeMode, setThemeMode] = useState('dark'); // 'light' | 'dark' | 'system'

  // Load saved preference
  useEffect(() => {
    const load = async () => {
      try {
        const info = await FileSystem.getInfoAsync(THEME_FILE);
        if (info.exists) {
          const content = await FileSystem.readAsStringAsync(THEME_FILE);
          const data = JSON.parse(content);
          if (data.themeMode) setThemeMode(data.themeMode);
        }
      } catch (e) {}
    };
    load();
  }, []);

  // Save preference when it changes
  const changeThemeMode = async (mode) => {
    setThemeMode(mode);
    try {
      await FileSystem.writeAsStringAsync(THEME_FILE, JSON.stringify({ themeMode: mode }));
    } catch (e) {}
  };

  // Calculate time-based greeting
  useEffect(() => {
    const calculateTimeMode = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) return 'morning';
      if (hour >= 11 && hour < 17) return 'afternoon';
      if (hour >= 17 && hour < 21) return 'evening';
      return 'night';
    };

    setTimeMode(calculateTimeMode());
    const interval = setInterval(() => setTimeMode(calculateTimeMode()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Resolve the active color scheme
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme !== 'light');
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ 
      timeMode, 
      themeMode, 
      setThemeMode: changeThemeMode,
      colors, 
      isDark,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
