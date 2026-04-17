import { BottomSheet, Button } from '@/src/components/ui';
import { InviteCodeCard } from './InviteCodeModal';
import { MemberList } from './MemberList';
import { roomApi } from '../api/roomApi';
import type { RoomMember } from '../types/room.types';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SettingsBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  inviteCode: string;
  members: RoomMember[];
};

export function SettingsBottomSheet({ visible, onClose, roomId, inviteCode, members }: SettingsBottomSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLeave = () => {
    Alert.alert('방 나가기', '정말 이 방을 나가시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: async () => {
          try {
            await roomApi.leaveRoom(roomId);
            onClose();
            router.replace('/(main)' as any);
          } catch {
            Alert.alert('오류', '방 나가기에 실패했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom || 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 초대코드 */}
        <InviteCodeCard inviteCode={inviteCode} />

        {/* 멤버 랭킹 */}
        <View style={{ marginTop: 24 }}>
          <MemberList members={members} />
        </View>

        {/* 방 나가기 */}
        <View style={{ marginTop: 16 }}>
          <Button title="방 나가기" variant="text" onPress={handleLeave} />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
