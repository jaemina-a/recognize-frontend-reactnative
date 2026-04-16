import { ScreenContainer } from '@/src/components/layout';
import { Button, Text } from '@/src/components/ui';
import { InviteCodeModal } from '@/src/features/room/components/InviteCodeModal';
import { MemberList } from '@/src/features/room/components/MemberList';
import { roomApi } from '@/src/features/room/api/roomApi';
import { useRoom } from '@/src/features/room/hooks/useRoom';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

export default function RoomSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { room } = useRoom(id);
  const [showInvite, setShowInvite] = useState(false);

  const handleLeave = () => {
    Alert.alert('방 나가기', '정말 이 방을 나가시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: async () => {
          try {
            await roomApi.leaveRoom(id);
            router.replace('/(main)' as any);
          } catch {
            Alert.alert('오류', '방 나가기에 실패했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <View className="flex-1 px-5 pt-4">
        <Text variant="h2" className="mb-6">방 설정</Text>

        {/* 초대코드 공유 */}
        <Button
          title="초대코드 보기"
          variant="outlined"
          className="mb-6"
          onPress={() => setShowInvite(true)}
        />

        {/* 멤버 목록 */}
        <MemberList members={room.members} />

        {/* 방 나가기 */}
        <View className="mt-auto pb-4">
          <Button
            title="방 나가기"
            variant="ghost"
            onPress={handleLeave}
          />
        </View>
      </View>

      <InviteCodeModal
        visible={showInvite}
        inviteCode={room.inviteCode}
        onClose={() => setShowInvite(false)}
      />
    </ScreenContainer>
  );
}
