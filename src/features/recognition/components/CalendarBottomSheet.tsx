import { BottomSheet } from '@/src/components/ui';
import type { RoomMember } from '@/src/features/room/types/room.types';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCalendar } from '../hooks/useCalendar';
import { CalendarView } from './CalendarView';

type CalendarBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  members: RoomMember[];
};

export function CalendarBottomSheet({ visible, onClose, roomId, members }: CalendarBottomSheetProps) {
  const { year, month, daysByMonth, goToPrevMonth, goToNextMonth, goToMonth } = useCalendar(roomId);
  const insets = useSafeAreaInsets();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <CalendarView
        year={year}
        month={month}
        daysByMonth={daysByMonth}
        members={members}
        onMonthChange={(dir) => (dir === 'prev' ? goToPrevMonth() : goToNextMonth())}
        onGoToMonth={goToMonth}
      />
      {/* Safe area spacer for home indicator */}
      <View style={{ height: insets.bottom || 16 }} />
    </BottomSheet>
  );
}
