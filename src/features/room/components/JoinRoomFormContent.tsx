import { Button, Input } from '@/src/components/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { roomApi } from '../api/roomApi';

type Props = {
  /** 방 참가 성공 직후 호출 (모달 닫기 등). */
  onSuccess?: () => void;
};

/**
 * BottomSheet 등 모달 컨텐츠로 사용하는 초대코드 참가 폼.
 * 외곽 컨테이너(SafeArea/AppBar)는 호출자가 책임진다.
 */
export function JoinRoomFormContent({ onSuccess }: Props) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    try {
      setIsJoining(true);
      const room = await roomApi.joinRoom(inviteCode.trim());
      onSuccess?.();
      router.push(`/room/${room.id}` as any);
    } catch (error: any) {
      const msg = error?.message || '방 참가에 실패했습니다.';
      Alert.alert('오류', msg);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}>
      <Input
        label="초대코드"
        placeholder="초대코드를 입력하세요"
        value={inviteCode}
        onChangeText={setInviteCode}
        autoCapitalize="characters"
        autoFocus
      />
      <View style={{ marginTop: 24 }}>
        <Button
          title={isJoining ? '참가 중...' : '참가하기'}
          onPress={handleJoin}
          disabled={!inviteCode.trim() || isJoining}
          size="lg"
        />
      </View>
    </View>
  );
}
