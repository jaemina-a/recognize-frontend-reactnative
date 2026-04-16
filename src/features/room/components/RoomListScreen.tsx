import { ScreenContainer } from '@/src/components/layout';
import { Button, Text } from '@/src/components/ui';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { useRoomList } from '../hooks/useRoomList';
import { RoomCard } from './RoomCard';

export function RoomListScreen() {
  const router = useRouter();
  const { rooms, refetch } = useRoomList();
  const { logout } = useAuth();

  // 화면에 포커스될 때마다 목록 새로고침 (방 만들기/뒤로가기 후 반영)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <ScreenContainer>
      <View className="flex-1 px-5 pt-4">
        {/* 헤더 */}
        <View className="flex-row justify-between items-center mb-6">
          <Text variant="h1">내 방</Text>
          <View className="flex-row gap-2">
            <Button
              title="로그아웃"
              size="sm"
              variant="outlined"
              onPress={logout}
            />
            <Button
              title="+ 방 만들기"
              size="sm"
              onPress={() => router.push('/(main)/create-room' as any)}
            />
          </View>
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
