import { IconButton, Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import { useChatStore } from '@/src/features/chat/stores/chatStore';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

type RoomHeaderProps = {
  roomName: string;
  roomId: string;
  onChatPress: () => void;
  onCalendarPress: () => void;
  onSettingsPress: () => void;
};

export function RoomHeader({ roomName, roomId, onChatPress, onCalendarPress, onSettingsPress }: RoomHeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const unread = useChatStore((s) => s.unreadByRoom[roomId] ?? 0);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: colors.surface,
      }}
    >
      <IconButton icon="arrow-left" variant="standard" onPress={() => router.back()} />
      <Text variant="titleLarge" numberOfLines={1} style={{ flex: 1, textAlign: 'center', marginHorizontal: 8 }}>
        {roomName}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View>
          <IconButton
            icon="message-outline"
            variant="standard"
            onPress={onChatPress}
          />
          {unread > 0 ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: colors.error,
                borderWidth: 1.5,
                borderColor: colors.surface,
              }}
            />
          ) : null}
        </View>
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
