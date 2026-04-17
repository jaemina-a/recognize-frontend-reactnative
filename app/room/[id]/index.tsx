import { ScreenContainer } from '@/src/components/layout';
import { Button } from '@/src/components/ui';
import { RecognitionFeed } from '@/src/features/recognition/components/RecognitionFeed';
import { RoomHeader } from '@/src/features/room/components/RoomHeader';
import { useRoom } from '@/src/features/room/hooks/useRoom';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { room, refetch: refetchRoom } = useRoom(id);

  useFocusEffect(
    useCallback(() => {
      refetchRoom();
    }, [refetchRoom]),
  );

  return (
    <ScreenContainer>
      <RoomHeader roomName={room.name} roomId={id} />

      {/* 카드 피드 (오늘의 랭킹 제거, 빈 멤버 카드 포함) */}
      <RecognitionFeed roomId={id} onRecognized={refetchRoom} members={room.members} />

      {/* 업로드 버튼 — "인증하기" */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 }}>
        <Button
          title="인증하기"
          size="lg"
          onPress={() => router.push(`/room/${id}/upload` as any)}
        />
      </View>
    </ScreenContainer>
  );
}
