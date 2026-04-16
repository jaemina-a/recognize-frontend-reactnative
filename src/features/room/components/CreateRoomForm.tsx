import { KeyboardAvoidingWrapper, ScreenContainer } from '@/src/components/layout';
import { Button, Input, Text } from '@/src/components/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { roomApi } from '../api/roomApi';

export function CreateRoomForm() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    console.log('[CreateRoom] handleCreate called, roomName:', roomName.trim());
    if (!roomName.trim()) return;
    try {
      setIsCreating(true);
      const room = await roomApi.createRoom(roomName.trim());
      console.log('[CreateRoom] room created:', JSON.stringify(room));
      router.dismiss();
      router.push(`/room/${room.id}` as any);
    } catch (e) {
      console.error('[CreateRoom] error:', e);
      Alert.alert('오류', '방 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
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
            disabled={!roomName.trim() || isCreating}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </ScreenContainer>
  );
}
