import { motion, useTheme } from '@/design';
import { Text } from '@/src/components/ui';
import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { CalendarDay } from '../types/recognition.types';
import { CalendarDayIndicator } from './CalendarDayIndicator';

const PANEL_WIDTH = Dimensions.get('window').width;
const THRESHOLD = PANEL_WIDTH * 0.3;
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const CELL_HEIGHT = 56;
const TOTAL_CELLS = 42; // 6 rows × 7 cols — fixed grid size

function offsetMonth(year: number, month: number, delta: number) {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

function key(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function buildRows(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Always pad to 6 rows so calendar height is constant across months
  while (cells.length < TOTAL_CELLS) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

type MonthGridProps = {
  year: number;
  month: number;
  dayMap: Map<string, string[]>;
  onDayPress?: (dateStr: string) => void;
};

function MonthGrid({ year, month, dayMap, onDayPress }: MonthGridProps) {
  const { colors } = useTheme();
  const rows = useMemo(() => buildRows(year, month), [year, month]);
  const today = new Date();

  return (
    <View style={{ width: PANEL_WIDTH, paddingHorizontal: 8 }}>
      {/* Day labels */}
      <View style={{ flexDirection: 'row' }}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
            <Text variant="labelMedium" color={colors.onSurfaceVariant}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Date grid — always 6 rows */}
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', height: CELL_HEIGHT }}>
          {row.map((day, colIndex) => {
            const dateStr = day
              ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              : '';
            const dotColors = day ? (dayMap.get(dateStr) ?? []) : [];
            const isToday =
              day !== null &&
              year === today.getFullYear() &&
              month === today.getMonth() + 1 &&
              day === today.getDate();

            return (
              <Pressable
                key={colIndex}
                onPress={day !== null && dotColors.length > 0 ? () => onDayPress?.(dateStr) : undefined}
                style={{
                  flex: 1,
                  height: CELL_HEIGHT,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingTop: 6,
                }}
              >
                {day !== null && (
                  <>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isToday ? colors.primary : 'transparent',
                      }}
                    >
                      <Text
                        variant="bodyMedium"
                        color={isToday ? colors.onPrimary : colors.onSurface}
                        style={{ fontWeight: isToday ? '700' : '400' }}
                      >
                        {day}
                      </Text>
                    </View>
                    <CalendarDayIndicator colors={dotColors} />
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

type SwipeableCalendarGridProps = {
  year: number;
  month: number;
  daysByMonth: Map<string, CalendarDay[]>;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onDayPress?: (dateStr: string) => void;
};

function toDayMap(days: CalendarDay[] | undefined): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (!days) return map;
  for (const d of days) map.set(d.date, d.uploads.map((r) => r.color));
  return map;
}

export function SwipeableCalendarGrid({ year, month, daysByMonth, onMonthChange, onDayPress }: SwipeableCalendarGridProps) {
  const translateX = useSharedValue(-PANEL_WIDTH);
  const gestureStartX = useSharedValue(-PANEL_WIDTH);

  const prev = useMemo(() => offsetMonth(year, month, -1), [year, month]);
  const next = useMemo(() => offsetMonth(year, month, 1), [year, month]);

  const prevDayMap = useMemo(() => toDayMap(daysByMonth.get(key(prev.year, prev.month))), [daysByMonth, prev]);
  const currDayMap = useMemo(() => toDayMap(daysByMonth.get(key(year, month))), [daysByMonth, year, month]);
  const nextDayMap = useMemo(() => toDayMap(daysByMonth.get(key(next.year, next.month))), [daysByMonth, next]);

  // ★ year/month가 바뀐 직후 동일 커밋 프레임에 translateX를 즉시 리셋
  // → 패널 데이터 재배치와 위치 리셋이 같은 프레임에 반영되어 1프레임 깜빡임 제거
  useLayoutEffect(() => {
    translateX.value = -PANEL_WIDTH;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  // 화면 회전 등으로 PANEL_WIDTH가 바뀐 경우에 대비한 초기 정렬
  useEffect(() => {
    translateX.value = -PANEL_WIDTH;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthChange = useCallback(
    (dir: 'prev' | 'next') => {
      // translateX는 useLayoutEffect에서 리셋하므로 여기서는 상태만 갱신
      onMonthChange(dir);
    },
    [onMonthChange],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          gestureStartX.value = translateX.value;
        })
        .onUpdate((event) => {
          translateX.value = gestureStartX.value + event.translationX;
        })
        .onEnd((event) => {
          const moved = event.translationX;
          if (moved < -THRESHOLD) {
            translateX.value = withSpring(-PANEL_WIDTH * 2, motion.spatialDefault, () => {
              runOnJS(handleMonthChange)('next');
            });
          } else if (moved > THRESHOLD) {
            translateX.value = withSpring(0, motion.spatialDefault, () => {
              runOnJS(handleMonthChange)('prev');
            });
          } else {
            translateX.value = withSpring(-PANEL_WIDTH, motion.spatialDefault);
          }
        }),
    [handleMonthChange],
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={{ overflow: 'hidden', width: PANEL_WIDTH }}>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[{ flexDirection: 'row', width: PANEL_WIDTH * 3 }, animStyle]}
        >
          <MonthGrid year={prev.year} month={prev.month} dayMap={prevDayMap} onDayPress={onDayPress} />
          <MonthGrid year={year} month={month} dayMap={currDayMap} onDayPress={onDayPress} />
          <MonthGrid year={next.year} month={next.month} dayMap={nextDayMap} onDayPress={onDayPress} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
