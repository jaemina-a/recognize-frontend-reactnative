import { IconButton, Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import type { RoomMember } from '@/src/features/room/types/room.types';
import { View } from 'react-native';
import type { CalendarDay } from '../types/recognition.types';
import { CalendarDot } from './CalendarDot';

type CalendarViewProps = {
  year: number;
  month: number;
  days: CalendarDay[];
  members: RoomMember[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export function CalendarView({
  year,
  month,
  days,
  members,
  onPrevMonth,
  onNextMonth,
}: CalendarViewProps) {
  const { colors } = useTheme();

  const dayMap = new Map<string, string[]>();
  for (const day of days) {
    dayMap.set(day.date, day.recognitions.map((r) => r.color));
  }

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const today = new Date();
  const isToday = (day: number) =>
    year === today.getFullYear() &&
    month === today.getMonth() + 1 &&
    day === today.getDate();

  return (
    <View style={{ flex: 1 }}>
      {/* Month navigator */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <IconButton icon="chevron-left" variant="standard" onPress={onPrevMonth} />
        <Text variant="titleLarge">{year}년 {month}월</Text>
        <IconButton icon="chevron-right" variant="standard" onPress={onNextMonth} />
      </View>

      {/* Day labels */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 8 }}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
            <Text variant="labelMedium" color={colors.onSurfaceVariant}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', paddingHorizontal: 8 }}>
          {row.map((day, colIndex) => {
            const dateStr = day
              ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              : '';
            const dotColors = day ? dayMap.get(dateStr) || [] : [];
            return (
              <View key={colIndex} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, minHeight: 48 }}>
                {day !== null && (
                  <>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isToday(day) ? colors.primary : 'transparent',
                      }}
                    >
                      <Text
                        variant="bodyMedium"
                        color={isToday(day) ? colors.onPrimary : colors.onSurface}
                        style={{ fontWeight: isToday(day) ? '700' : '400' }}
                      >
                        {day}
                      </Text>
                    </View>
                    <CalendarDot colors={dotColors} />
                  </>
                )}
              </View>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: colors.outlineVariant,
          marginTop: 8,
        }}
      >
        {members.map((member) => (
          <View key={member.userId} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, marginRight: 6, backgroundColor: member.color }} />
            <Text variant="bodySmall" color={colors.onSurfaceVariant}>{member.nickname}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
