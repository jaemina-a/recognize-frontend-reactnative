import { ScreenContainer } from '@/src/components/layout';
import { IconButton, Text } from '@/src/components/ui';
import { CalendarView } from '@/src/features/recognition/components/CalendarView';
import { useCalendar } from '@/src/features/recognition/hooks/useCalendar';
import { useRoom } from '@/src/features/room/hooks/useRoom';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

export default function CalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { room } = useRoom(id);
  const { year, month, days, goToPrevMonth, goToNextMonth } = useCalendar(id);

  return (
    <ScreenContainer>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <IconButton icon="arrow-left" variant="standard" onPress={() => router.back()} />
        <Text variant="titleLarge" style={{ marginLeft: 12 }}>캘린더</Text>
      </View>
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
