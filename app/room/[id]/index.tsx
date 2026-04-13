import { ScreenContainer } from '@/src/components/layout';
import { Button } from '@/src/components/ui';
import { RecognitionFeed } from '@/src/features/recognition/components/RecognitionFeed';
import { ScoreBoard } from '@/src/features/recognition/components/ScoreBoard';
import { RoomHeader } from '@/src/features/room/components/RoomHeader';
import { useRoom } from '@/src/features/room/hooks/useRoom';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { room } = useRoom(id);

  return (
    <ScreenContainer>
      <RoomHeader roomName={room.name} roomId={id} />

      {/* 카드 피드 */}
      <RecognitionFeed roomId={id} />

      {/* 점수 보드 */}
      <ScoreBoard members={room.members} />

      {/* 업로드 버튼 */}
      <View className="px-5 pb-4">
        <Button
          title="📸 갓생 인증하기"
          onPress={() => router.push(`/room/${id}/upload` as any)}
        />
      </View>
    </ScreenContainer>
  );
}
