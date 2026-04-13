import { Badge, Text } from '@/src/components/ui';
import { Pressable, View } from 'react-native';
import type { Room } from '../types/room.types';

type RoomCardProps = {
  room: Room;
  onPress: () => void;
};

export function RoomCard({ room, onPress }: RoomCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="border border-gray-200 rounded-xl p-4 mb-3 bg-white"
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text variant="h3" className="flex-1">{room.name}</Text>
        <Badge label={`${room.members.length}명`} />
      </View>
      <Text variant="caption">
        멤버: {room.members.map((m) => m.nickname).join(', ')}
      </Text>
    </Pressable>
  );
}
