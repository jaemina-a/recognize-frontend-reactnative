import { ScreenContainer } from '@/src/components/layout';
import { Button, IconButton, Text } from '@/src/components/ui';
import { InviteCodeCard } from '@/src/features/room/components/InviteCodeModal';
import { MemberList } from '@/src/features/room/components/MemberList';
import { roomApi } from '@/src/features/room/api/roomApi';
import { useRoom } from '@/src/features/room/hooks/useRoom';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, View } from 'react-native';

export default function RoomSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { room } = useRoom(id);

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
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ height: 56, flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon="arrow-left" variant="standard" onPress={() => router.back()} />
          <Text variant="titleLarge" style={{ marginLeft: 12 }}>방 설정</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16 }}>
          {/* 초대코드 — 항상 표시되는 카드 */}
          <InviteCodeCard inviteCode={room.inviteCode} />

          {/* 멤버 목록 */}
          <View style={{ marginTop: 24 }}>
            <MemberList members={room.members} />
          </View>
        </ScrollView>

        {/* 방 나가기 */}
        <View style={{ paddingBottom: 16 }}>
          <Button title="방 나가기" variant="text" onPress={handleLeave} />
        </View>
      </View>
    </ScreenContainer>
  );
}
