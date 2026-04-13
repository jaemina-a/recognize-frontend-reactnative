import { KeyboardAvoidingWrapper, ScreenContainer } from '@/src/components/layout';
import { Button, Input, Text } from '@/src/components/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export function CreateRoomForm() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');

  const handleCreate = () => {
    // TODO: roomApi.createRoom(roomName)
    console.log('방 만들기:', roomName);
    router.back();
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingWrapper>
        <View className="flex-1 px-5 pt-8">
          <Text variant="h2" className="mb-6">방 만들기</Text>

          <Text className="mb-2 font-semibold">방 이름</Text>
          <Input
            placeholder="방 이름을 입력하세요"
            value={roomName}
            onChangeText={setRoomName}
            className="mb-6"
          />

          <Button
            title="만들기"
            onPress={handleCreate}
            disabled={!roomName.trim()}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </ScreenContainer>
  );
}
