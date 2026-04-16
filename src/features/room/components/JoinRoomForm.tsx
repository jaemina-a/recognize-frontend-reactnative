import { KeyboardAvoidingWrapper, ScreenContainer } from '@/src/components/layout';
import { Button, Input, Text } from '@/src/components/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { roomApi } from '../api/roomApi';

export function JoinRoomForm() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    try {
      setIsJoining(true);
      const room = await roomApi.joinRoom(inviteCode.trim());
      router.replace(`/room/${room.id}` as any);
    } catch (error: any) {
      const msg = error?.message || '방 참가에 실패했습니다.';
      Alert.alert('오류', msg);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingWrapper>
        <View className="flex-1 px-5 pt-8">
          <Text variant="h2" className="mb-6">초대코드로 참가</Text>

          <Text className="mb-2 font-semibold">초대코드</Text>
          <Input
            placeholder="초대코드를 입력하세요"
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
            className="mb-6"
          />

          <Button
            title="참가하기"
            onPress={handleJoin}
            disabled={!inviteCode.trim() || isJoining}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </ScreenContainer>
  );
}
