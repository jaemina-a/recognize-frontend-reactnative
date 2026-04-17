import { Badge, Card, Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import { Pressable, View } from 'react-native';
import type { Room } from '../types/room.types';

type RoomCardProps = {
  room: Room;
  onPress: () => void;
};

export function RoomCard({ room, onPress }: RoomCardProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, marginBottom: 12 })}
    >
      <Card variant="outlined">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text variant="titleMedium" style={{ flex: 1, marginRight: 8 }}>{room.name}</Text>
          <Badge label={`${room.members.length}명`} variant="secondary" />
        </View>
        <Text variant="bodySmall" color={colors.onSurfaceVariant} numberOfLines={1}>
          멤버: {room.members.map((m) => m.nickname).join(', ')}
        </Text>
      </Card>
    </Pressable>
  );
}
