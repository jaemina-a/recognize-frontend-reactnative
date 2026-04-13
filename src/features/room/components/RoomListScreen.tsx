import { ScreenContainer } from '@/src/components/layout';
import { Button, Text } from '@/src/components/ui';
import { useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';
import { useRoomList } from '../hooks/useRoomList';
import { RoomCard } from './RoomCard';

export function RoomListScreen() {
  const router = useRouter();
  const { rooms } = useRoomList();

  return (
    <ScreenContainer>
      <View className="flex-1 px-5 pt-4">
        {/* 헤더 */}
        <View className="flex-row justify-between items-center mb-6">
          <Text variant="h1">내 방</Text>
          <Button
            title="+ 방 만들기"
            size="sm"
            onPress={() => router.push('/(main)/create-room' as any)}
          />
        </View>

        {/* 방 목록 */}
        <FlatList
          className="flex-1"
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoomCard
              room={item}
              onPress={() => router.push(`/room/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text variant="caption">아직 참여한 방이 없어요</Text>
              <Text variant="caption">방을 만들거나 초대코드로 참가해보세요!</Text>
            </View>
          }
        />

        {/* 초대코드 참가 */}
        <View className="pb-4">
          <Button
            title="초대코드로 참가"
            variant="outlined"
            onPress={() => router.push('/room/join' as any)}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
