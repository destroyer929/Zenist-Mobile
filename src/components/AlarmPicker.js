import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Modal, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_HEADER = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const ITEM_HEIGHT = 52;

const WheelColumn = ({ data, selected, onSelect, colors, isDark }) => {
  const flatRef = useRef(null);
  const initialIndex = data.indexOf(selected);

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < data.length && data[index] !== selected) {
      onSelect(data[index]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.wheelContainer}>
      {/* Selection highlight band */}
      <View style={[styles.selectionBand, { backgroundColor: colors.gold + '20', borderColor: colors.gold + '40' }]} />
      <FlatList
        ref={flatRef}
        data={data}
        keyExtractor={(item) => String(item)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        renderItem={({ item }) => {
          const isSelected = item === selected;
          return (
            <Pressable 
              onPress={() => { onSelect(item); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={styles.wheelItem}
            >
              <Text style={[
                styles.wheelText,
                { color: colors.textWhite, opacity: 0.25 },
                isSelected && { opacity: 1, fontSize: 32, fontWeight: '700', color: colors.gold },
              ]}>
                {String(item).padStart(2, '0')}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const AlarmPicker = ({ visible, onClose, onConfirm, initialDate }) => {
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState('date');
  const now = initialDate ? new Date(initialDate) : new Date();
  
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [selectedHour, setSelectedHour] = useState(now.getHours() % 12 || 12);
  const [selectedMinute, setSelectedMinute] = useState(now.getMinutes());
  const [selectedPeriod, setSelectedPeriod] = useState(now.getHours() >= 12 ? 'PM' : 'AM');

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);

  const prevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };

  const nextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  const goToTime = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep('time');
  };

  const handleConfirm = () => {
    let hours = selectedHour;
    if (selectedPeriod === 'PM' && hours !== 12) hours += 12;
    if (selectedPeriod === 'AM' && hours === 12) hours = 0;
    const finalDate = new Date(selectedYear, selectedMonth, selectedDay, hours, selectedMinute, 0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(finalDate);
    setStep('date');
  };

  const handleClose = () => { setStep('date'); onClose(); };

  const today = new Date();
  const isToday = (day) => selectedYear === today.getFullYear() && selectedMonth === today.getMonth() && day === today.getDate();
  const isSelected = (day) => day === selectedDay;

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.card, { backgroundColor: isDark ? '#16181f' : '#ffffff' }]}>
          
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.gold }]}>
              {step === 'date' ? 'SELECT DATE' : 'SELECT TIME'}
            </Text>
            <Pressable onPress={handleClose}>
              <X color={colors.textMuted} size={20} />
            </Pressable>
          </View>

          {step === 'date' ? (
            <>
              <View style={styles.monthNav}>
                <Pressable onPress={prevMonth} style={[styles.navBtn, { backgroundColor: colors.glass }]}>
                  <ChevronLeft color={colors.textWhite} size={18} />
                </Pressable>
                <Text style={[styles.monthLabel, { color: colors.textWhite }]}>
                  {MONTHS[selectedMonth]} {selectedYear}
                </Text>
                <Pressable onPress={nextMonth} style={[styles.navBtn, { backgroundColor: colors.glass }]}>
                  <ChevronRight color={colors.textWhite} size={18} />
                </Pressable>
              </View>

              <View style={styles.dayHeaders}>
                {DAYS_HEADER.map(d => (
                  <Text key={d} style={[styles.dayHeader, { color: colors.textMuted }]}>{d}</Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarCells.map((day, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => day && (() => { setSelectedDay(day); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); })()}
                    style={[
                      styles.calendarCell,
                      day && isSelected(day) && [styles.selectedCell, { backgroundColor: colors.gold }],
                      day && isToday(day) && !isSelected(day) && { borderWidth: 1, borderColor: colors.gold },
                    ]}
                  >
                    {day && (
                      <Text style={[
                        styles.cellText,
                        { color: colors.textWhite },
                        isSelected(day) && { color: isDark ? colors.bgDeep : '#fff', fontWeight: '700' },
                      ]}>
                        {day}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={goToTime} style={[styles.confirmBtn, { backgroundColor: colors.gold }]}>
                <Text style={[styles.confirmText, { color: isDark ? colors.bgDeep : '#fff' }]}>Select Time →</Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* Live Time Preview */}
              <View style={styles.timePreviewSection}>
                <Text style={[styles.timePreviewSmall, { color: colors.textMuted }]}>
                  {MONTHS[selectedMonth]} {selectedDay}, {selectedYear}
                </Text>
                <Text style={[styles.timePreviewLarge, { color: colors.textWhite }]}>
                  {String(selectedHour).padStart(2, '0')}
                  <Text style={{ color: colors.gold }}>:</Text>
                  {String(selectedMinute).padStart(2, '0')}
                  <Text style={[styles.periodInline, { color: colors.gold }]}> {selectedPeriod}</Text>
                </Text>
              </View>

              {/* Scroll Wheels */}
              <View style={styles.wheelsRow}>
                <View style={styles.wheelWrapper}>
                  <Text style={[styles.wheelLabel, { color: colors.textMuted }]}>HOUR</Text>
                  <WheelColumn
                    data={hours}
                    selected={selectedHour}
                    onSelect={setSelectedHour}
                    colors={colors}
                    isDark={isDark}
                  />
                </View>

                <View style={styles.wheelDivider}>
                  <Text style={[styles.wheelColon, { color: colors.gold }]}>:</Text>
                </View>

                <View style={styles.wheelWrapper}>
                  <Text style={[styles.wheelLabel, { color: colors.textMuted }]}>MIN</Text>
                  <WheelColumn
                    data={minutes}
                    selected={selectedMinute}
                    onSelect={setSelectedMinute}
                    colors={colors}
                    isDark={isDark}
                  />
                </View>
              </View>

              {/* AM/PM Toggle */}
              <View style={[styles.periodRow, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Pressable 
                  onPress={() => { setSelectedPeriod('AM'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                  style={[styles.periodOption, selectedPeriod === 'AM' && { backgroundColor: colors.gold }]}
                >
                  <Text style={[styles.periodOptionText, { color: selectedPeriod === 'AM' ? (isDark ? colors.bgDeep : '#fff') : colors.textMuted }]}>AM</Text>
                </Pressable>
                <Pressable 
                  onPress={() => { setSelectedPeriod('PM'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                  style={[styles.periodOption, selectedPeriod === 'PM' && { backgroundColor: colors.gold }]}
                >
                  <Text style={[styles.periodOptionText, { color: selectedPeriod === 'PM' ? (isDark ? colors.bgDeep : '#fff') : colors.textMuted }]}>PM</Text>
                </Pressable>
              </View>

              {/* Confirm */}
              <Pressable onPress={handleConfirm} style={[styles.confirmBtn, { backgroundColor: colors.gold }]}>
                <Check color={isDark ? colors.bgDeep : '#fff'} size={18} />
                <Text style={[styles.confirmText, { color: isDark ? colors.bgDeep : '#fff', marginLeft: 8 }]}>Set Alarm</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 380, borderRadius: 28, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 3 },
  // Month Nav
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  navBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  monthLabel: { fontSize: 18, fontWeight: '700' },
  // Calendar
  dayHeaders: { flexDirection: 'row', marginBottom: 8 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  calendarCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  selectedCell: { borderRadius: 14 },
  cellText: { fontSize: 15, fontWeight: '500' },
  // Time Preview
  timePreviewSection: { alignItems: 'center', marginBottom: 16, marginTop: 4 },
  timePreviewSmall: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  timePreviewLarge: { fontSize: 52, fontWeight: '200', letterSpacing: 2 },
  periodInline: { fontSize: 20, fontWeight: '700' },
  // Scroll Wheels
  wheelsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: ITEM_HEIGHT * 5, marginBottom: 16 },
  wheelWrapper: { flex: 1, alignItems: 'center' },
  wheelLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  wheelContainer: { height: ITEM_HEIGHT * 5, width: '100%', overflow: 'hidden', position: 'relative' },
  selectionBand: { position: 'absolute', top: ITEM_HEIGHT * 2, left: 8, right: 8, height: ITEM_HEIGHT, borderRadius: 14, borderWidth: 1, zIndex: 0 },
  wheelItem: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  wheelText: { fontSize: 22, fontWeight: '400' },
  wheelDivider: { width: 30, alignItems: 'center', paddingTop: 28 },
  wheelColon: { fontSize: 36, fontWeight: '300' },
  // AM/PM
  periodRow: { flexDirection: 'row', borderRadius: 16, padding: 4, marginBottom: 16, borderWidth: 1 },
  periodOption: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14 },
  periodOptionText: { fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  // Confirm
  confirmBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 52, borderRadius: 18, marginTop: 4 },
  confirmText: { fontSize: 16, fontWeight: '700' },
});

export default AlarmPicker;
