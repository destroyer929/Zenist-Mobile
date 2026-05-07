import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { TaskProvider } from './src/context/TaskContext';
import Backdrop from './src/components/Backdrop';
import MainNavigator from './src/navigation/MainNavigator';

function AppContent() {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer theme={{
      dark: isDark,
      colors: {
        background: 'transparent',
        card: 'transparent',
        text: colors.textWhite,
        border: 'transparent',
        notification: colors.gold,
      }
    }}>
      <View style={[styles.container, { backgroundColor: colors.bgDeep }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        {isDark && <Backdrop />}
        <MainNavigator />
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
