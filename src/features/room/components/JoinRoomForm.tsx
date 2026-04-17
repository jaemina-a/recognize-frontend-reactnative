import { KeyboardAvoidingWrapper, ScreenContainer } from '@/src/components/layout';
import { Button, IconButton, Input, Text } from '@/src/components/ui';
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

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingWrapper>
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
          <View style={{ height: 56, flexDirection: 'row', alignItems: 'center' }}>
            <IconButton icon="arrow-left" variant="standard" onPress={handleBack} />
            <Text variant="titleLarge" style={{ marginLeft: 12 }}>초대코드로 참가</Text>
          </View>

          <View style={{ marginTop: 24 }}>
            <Input
              label="초대코드"
              placeholder="초대코드를 입력하세요"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              autoFocus
            />
          </View>

          <View style={{ marginTop: 32 }}>
            <Button
              title={isJoining ? '참가 중...' : '참가하기'}
              onPress={handleJoin}
              disabled={!inviteCode.trim() || isJoining}
              size="lg"
            />
          </View>
        </View>
      </KeyboardAvoidingWrapper>
    </ScreenContainer>
  );
}
