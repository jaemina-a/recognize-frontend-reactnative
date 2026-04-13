import { KeyboardAvoidingWrapper, ScreenContainer } from '@/src/components/layout';
import { Button, Input, Text } from '@/src/components/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export function JoinRoomForm() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');

  const handleJoin = () => {
    // TODO: roomApi.joinRoom(inviteCode)
    console.log('초대코드 참가:', inviteCode);
    router.back();
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
            disabled={!inviteCode.trim()}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </ScreenContainer>
  );
}
