import { Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import type { RoomMember } from '@/src/features/room/types/room.types';
import { useState } from 'react';
import { View } from 'react-native';
import type { CalendarDay } from '../types/recognition.types';
import { CalendarHeader } from './CalendarHeader';
import { MonthYearPicker } from './MonthYearPicker';
import { SwipeableCalendarGrid } from './SwipeableCalendarGrid';

type CalendarViewProps = {
  year: number;
  month: number;
  daysByMonth: Map<string, CalendarDay[]>;
  members: RoomMember[];
  onMonthChange: (direction: 'prev' | 'next') => void;
  onGoToMonth: (year: number, month: number) => void;
  onDayPress?: (dateStr: string) => void;
};

export function CalendarView({
  year,
  month,
  daysByMonth,
  members,
  onMonthChange,
  onGoToMonth,
  onDayPress,
}: CalendarViewProps) {
  const { colors } = useTheme();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <View>
      <CalendarHeader
        year={year}
        month={month}
        onPrev={() => onMonthChange('prev')}
        onNext={() => onMonthChange('next')}
        onTogglePicker={() => setIsPickerOpen((v) => !v)}
        isPickerOpen={isPickerOpen}
      />

      {isPickerOpen ? (
        <MonthYearPicker
          year={year}
          month={month}
          onChange={(y, m) => {
            // Picker stays open so user can adjust both month and year.
            // It is dismissed via the header toggle (▲) or scrim tap.
            onGoToMonth(y, m);
          }}
        />
      ) : (
        <SwipeableCalendarGrid
          year={year}
          month={month}
          daysByMonth={daysByMonth}
          onMonthChange={onMonthChange}
          onDayPress={onDayPress}
        />
      )}

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
          <View
            key={member.userId}
            style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                marginRight: 6,
                backgroundColor: member.color,
              }}
            />
            <Text variant="bodySmall" color={colors.onSurfaceVariant}>{member.nickname}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

