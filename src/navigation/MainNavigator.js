import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Layout, Search, User } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import UpcomingScreen from '../screens/UpcomingScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 25 : 15,
          left: 20,
          right: 20,
          height: 68,
          borderRadius: 24,
          backgroundColor: isDark ? 'rgb(20,21,28)' : 'rgb(255,255,255)',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: isDark ? '#000' : colors.gold,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.4 : 0.15,
          shadowRadius: 16,
          paddingBottom: 0,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        },
        tabBarIcon: ({ color, focused }) => {
          const iconSize = 22;
          let IconComponent;
          if (route.name === 'Home') IconComponent = Home;
          else if (route.name === 'Timeline') IconComponent = Calendar;
          else if (route.name === 'Projects') IconComponent = Layout;
          else if (route.name === 'Search') IconComponent = Search;
          else if (route.name === 'Profile') IconComponent = User;

          return (
            <View style={[styles.tabIcon, focused && [styles.tabIconActive, { backgroundColor: colors.gold + '15' }]]}>
              <IconComponent color={color} size={iconSize} />
              {focused && <View style={[styles.tabDot, { backgroundColor: colors.gold }]} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Timeline" component={UpcomingScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 14, marginTop: 22 },
  tabIconActive: {},
  tabDot: { width: 4, height: 4, borderRadius: 2, marginTop: 4 },
});

export default MainNavigator;
