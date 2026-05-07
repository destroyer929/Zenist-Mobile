import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import BentoCard from '../components/BentoCard';
import { User, Shield, Bell, Sun, Moon, Smartphone, ChevronLeft, ChevronRight, Flame, Award, Zap, Target, TrendingUp, LogOut } from 'lucide-react-native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { tasks, history } = useTasks();
  const { colors, themeMode, setThemeMode, isDark } = useTheme();

  const completedCount = tasks.filter(t => t.completed).length;
  const activeCount = tasks.filter(t => !t.completed).length;
  
  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = history.find(h => h.date === dateStr);
      if (dayData && dayData.count > 0) streak++;
      else if (i > 0) break;
    }
    return streak;
  };

  const streak = calculateStreak();

  const getRank = () => {
    if (completedCount >= 50) return { name: 'Diamond', color: '#b9f2ff' };
    if (completedCount >= 25) return { name: 'Platinum', color: '#e5e4e2' };
    if (completedCount >= 10) return { name: 'Gold', color: colors.gold };
    if (completedCount >= 5) return { name: 'Silver', color: '#c0c0c0' };
    return { name: 'Bronze', color: '#cd7f32' };
  };

  const rank = getRank();
  
  const last21Days = [...Array(21)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (20 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayData = history.find(h => h.date === dateStr);
    return { date: dateStr, count: dayData ? dayData.count : 0, label: d.toLocaleDateString('en', { weekday: 'narrow' }) };
  });

  const maxCount = Math.max(...last21Days.map(d => d.count), 1);

  const themeModes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'Auto', icon: Smartphone },
  ];

  const SettingItem = ({ icon: Icon, title, value, onPress, iconBg }) => (
    <Pressable onPress={onPress} style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg || colors.glass }]}>
        <Icon color={colors.textWhite} size={18} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: colors.textWhite }]}>{title}</Text>
        {value && <Text style={[styles.settingValue, { color: colors.textMuted }]}>{value}</Text>}
      </View>
      <ChevronRight color={colors.textMuted} size={18} />
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'transparent' : colors.bgDeep }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('Home')} style={[styles.backBtn, { backgroundColor: colors.glass }]}>
          <ChevronLeft color={colors.gold} size={22} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textWhite }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { borderColor: colors.glassBorder }]}>
          <LinearGradient
            colors={isDark ? ['rgba(239,176,46,0.08)', 'rgba(239,176,46,0.02)'] : ['rgba(239,176,46,0.12)', 'rgba(239,176,46,0.04)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={[styles.avatar]}>
            <LinearGradient
              colors={[colors.gold, colors.amber || colors.gold]}
              style={styles.avatarGradient}
            >
              <User color={isDark ? colors.bgDeep : '#fff'} size={32} />
            </LinearGradient>
          </View>
          <Text style={[styles.userName, { color: colors.textWhite }]}>Karunakar</Text>
          <View style={[styles.rankBadge, { backgroundColor: rank.color + '20', borderColor: rank.color + '40' }]}>
            <Award color={rank.color} size={12} />
            <Text style={[styles.rankText, { color: rank.color }]}>{rank.name} Rank</Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={[styles.quickNum, { color: colors.textWhite }]}>{completedCount}</Text>
              <Text style={[styles.quickLabel, { color: colors.textMuted }]}>Completed</Text>
            </View>
            <View style={[styles.quickDivider, { backgroundColor: colors.glassBorder }]} />
            <View style={styles.quickStat}>
              <Text style={[styles.quickNum, { color: colors.textWhite }]}>{streak}</Text>
              <Text style={[styles.quickLabel, { color: colors.textMuted }]}>Day Streak</Text>
            </View>
            <View style={[styles.quickDivider, { backgroundColor: colors.glassBorder }]} />
            <View style={styles.quickStat}>
              <Text style={[styles.quickNum, { color: colors.textWhite }]}>{activeCount}</Text>
              <Text style={[styles.quickLabel, { color: colors.textMuted }]}>Active</Text>
            </View>
          </View>
        </View>

        {/* Activity Heatmap */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.gold }]}>Activity</Text>
          <View style={[styles.heatmapCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
            <View style={styles.heatmapGrid}>
              {last21Days.map((day, idx) => {
                const intensity = day.count / maxCount;
                const bg = day.count > 0 
                  ? (intensity > 0.6 ? colors.gold : colors.gold + '60')
                  : colors.glass;
                return (
                  <View key={idx} style={styles.heatCol}>
                    <View style={[styles.heatSquare, { backgroundColor: bg }]} />
                    {idx % 7 === 0 && <Text style={[styles.heatLabel, { color: colors.textMuted }]}>{day.label}</Text>}
                  </View>
                );
              })}
            </View>
            <View style={[styles.heatLegend, { borderTopColor: colors.glassBorder }]}>
              <View style={styles.legendItem}>
                <Flame color={colors.gold} size={14} />
                <Text style={[styles.legendText, { color: colors.textMuted }]}>{completedCount} total missions</Text>
              </View>
              <View style={styles.legendItem}>
                <Zap color={colors.blue} size={14} />
                <Text style={[styles.legendText, { color: colors.textMuted }]}>{streak} day streak</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.gold }]}>Appearance</Text>
          <View style={[styles.themeCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
            {themeModes.map(mode => {
              const isActive = themeMode === mode.id;
              const Icon = mode.icon;
              return (
                <Pressable
                  key={mode.id}
                  onPress={() => setThemeMode(mode.id)}
                  style={[styles.themeOption, isActive && { backgroundColor: colors.gold }]}
                >
                  <Icon color={isActive ? (isDark ? colors.bgDeep : '#fff') : colors.textMuted} size={18} />
                  <Text style={[
                    styles.themeText,
                    { color: isActive ? (isDark ? colors.bgDeep : '#fff') : colors.textMuted },
                    isActive && { fontWeight: '800' },
                  ]}>{mode.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.gold }]}>Settings</Text>
          <SettingItem icon={Bell} title="Notifications" value="In-App Alerts" iconBg={colors.gold + '15'} />
          <SettingItem icon={Shield} title="Privacy & Security" value="Standard" iconBg={colors.blue + '15'} />
          <SettingItem icon={Target} title="Daily Goal" value="5 missions" iconBg={colors.gold + '15'} />
        </View>

        {/* Logout */}
        <Pressable style={[styles.logoutBtn, { backgroundColor: 'rgba(255,68,68,0.08)', borderColor: 'rgba(255,68,68,0.2)' }]}>
          <LogOut color="#ff4444" size={18} />
          <Text style={styles.logoutText}>Leave Sanctuary</Text>
        </Pressable>

        {/* Version */}
        <Text style={[styles.version, { color: colors.textMuted }]}>Zenist v2.0 · Precision Edition</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 110 },
  backBtn: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  scroll: { paddingBottom: 180, paddingHorizontal: 20 },
  // Profile Card
  profileCard: { borderRadius: 28, padding: 28, alignItems: 'center', marginBottom: 24, overflow: 'hidden', borderWidth: 1 },
  avatar: { marginBottom: 16 },
  avatarGradient: { width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  rankBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 8, borderWidth: 1 },
  rankText: { fontSize: 11, fontWeight: '700', marginLeft: 5, letterSpacing: 0.5 },
  quickStats: { flexDirection: 'row', marginTop: 24, width: '100%' },
  quickStat: { flex: 1, alignItems: 'center' },
  quickNum: { fontSize: 22, fontWeight: '800' },
  quickLabel: { fontSize: 10, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  quickDivider: { width: 1, height: 36 },
  // Section
  sectionBlock: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 12, marginLeft: 4 },
  // Heatmap
  heatmapCard: { borderRadius: 22, padding: 18, borderWidth: 1 },
  heatmapGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  heatCol: { alignItems: 'center' },
  heatSquare: { width: 12, height: 12, borderRadius: 3, marginBottom: 3 },
  heatLabel: { fontSize: 8, fontWeight: '600' },
  heatLegend: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendText: { fontSize: 11, fontWeight: '600', marginLeft: 6 },
  // Theme
  themeCard: { flexDirection: 'row', borderRadius: 20, padding: 5, borderWidth: 1 },
  themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, gap: 8 },
  themeText: { fontSize: 13, fontWeight: '600' },
  // Settings
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 8, borderWidth: 1 },
  settingIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600' },
  settingValue: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 18, marginTop: 8, borderWidth: 1 },
  logoutText: { color: '#ff4444', fontSize: 15, fontWeight: '700', marginLeft: 10 },
  // Version
  version: { textAlign: 'center', fontSize: 11, fontWeight: '500', marginTop: 20, opacity: 0.5 },
});

export default ProfileScreen;
