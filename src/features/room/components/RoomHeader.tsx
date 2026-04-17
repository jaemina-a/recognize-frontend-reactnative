import { IconButton, Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

type RoomHeaderProps = {
  roomName: string;
  roomId: string;
  onCalendarPress: () => void;
  onSettingsPress: () => void;
};

export function RoomHeader({ roomName, onCalendarPress, onSettingsPress }: RoomHeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.outlineVariant,
        backgroundColor: colors.surface,
      }}
    >
      <IconButton icon="arrow-left" variant="standard" onPress={() => router.back()} />
      <Text variant="titleLarge" numberOfLines={1} style={{ flex: 1, textAlign: 'center', marginHorizontal: 8 }}>
        {roomName}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <IconButton
          icon="calendar-month-outline"
          variant="standard"
          onPress={onCalendarPress}
        />
        <IconButton
          icon="cog-outline"
          variant="standard"
          onPress={onSettingsPress}
        />
      </View>
    </View>
  );
}
