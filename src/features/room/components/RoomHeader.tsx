import { Text } from '@/src/components/ui';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

type RoomHeaderProps = {
  roomName: string;
  roomId: string;
};

export function RoomHeader({ roomName, roomId }: RoomHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
      <Pressable onPress={() => router.back()}>
        <Text className="text-lg">←</Text>
      </Pressable>
      <Text variant="h3">{roomName}</Text>
      <View className="flex-row gap-3">
        <Pressable onPress={() => router.push(`/room/${roomId}/calendar` as any)}>
          <Text className="text-lg">📅</Text>
        </Pressable>
        <Pressable onPress={() => router.push(`/room/${roomId}/settings` as any)}>
          <Text className="text-lg">⚙</Text>
        </Pressable>
      </View>
    </View>
  );
}
