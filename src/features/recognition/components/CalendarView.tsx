import { Text } from '@/src/components/ui';
import { Pressable, View } from 'react-native';
import type { RoomMember } from '@/src/features/room/types/room.types';
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
  // Build a map: date string -> colors
  const dayMap = new Map<string, string[]>();
  for (const day of days) {
    dayMap.set(day.date, day.recognitions.map((r) => r.color));
  }

  // Calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Fill remaining cells to complete the last row
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
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4">
        <Pressable onPress={onPrevMonth} className="p-2">
          <Text className="text-lg">◀</Text>
        </Pressable>
        <Text variant="h3">{year}년 {month}월</Text>
        <Pressable onPress={onNextMonth} className="p-2">
          <Text className="text-lg">▶</Text>
        </Pressable>
      </View>

      {/* Day labels */}
      <View className="flex-row px-2">
        {DAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center py-2">
            <Text variant="caption" className="font-semibold">{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row px-2">
          {row.map((day, colIndex) => {
            const dateStr = day
              ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              : '';
            const colors = day ? dayMap.get(dateStr) || [] : [];

            return (
              <View key={colIndex} className="flex-1 items-center py-2 min-h-[48px]">
                {day !== null && (
                  <>
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        isToday(day) ? 'bg-black' : ''
                      }`}
                    >
                      <Text
                        className={`text-sm ${isToday(day) ? 'text-white font-bold' : ''}`}
                      >
                        {day}
                      </Text>
                    </View>
                    <CalendarDot colors={colors} />
                  </>
                )}
              </View>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View className="flex-row flex-wrap px-5 py-4 border-t border-gray-200 mt-2">
        {members.map((member) => (
          <View key={member.userId} className="flex-row items-center mr-4 mb-2">
            <View
              className="w-3 h-3 rounded-full mr-1.5"
              style={{ backgroundColor: member.color }}
            />
            <Text variant="caption">{member.nickname}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
