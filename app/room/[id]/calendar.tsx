import { ScreenContainer } from '@/src/components/layout';
import { CalendarView } from '@/src/features/recognition/components/CalendarView';
import { useCalendar } from '@/src/features/recognition/hooks/useCalendar';
import { useRoom } from '@/src/features/room/hooks/useRoom';
import { useLocalSearchParams } from 'expo-router';

export default function CalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { room } = useRoom(id);
  const { year, month, days, goToPrevMonth, goToNextMonth } = useCalendar(id);

  return (
    <ScreenContainer>
      <CalendarView
        year={year}
        month={month}
        days={days}
        members={room.members}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
      />
    </ScreenContainer>
  );
}
