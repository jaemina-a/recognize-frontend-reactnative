import { KeyboardAvoidingWrapper, ScreenContainer } from '@/src/components/layout';
import { Button, IconButton, Input, Text } from '@/src/components/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { roomApi } from '../api/roomApi';

export function CreateRoomForm() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!roomName.trim()) return;
    try {
      setIsCreating(true);
      const room = await roomApi.createRoom(roomName.trim());
      router.dismiss();
      router.push(`/room/${room.id}` as any);
    } catch (e) {
      console.error('[CreateRoom] error:', e);
      Alert.alert('오류', '방 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.dismiss();
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingWrapper>
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
          {/* App bar with back button */}
          <View style={{ height: 56, flexDirection: 'row', alignItems: 'center' }}>
            <IconButton icon="arrow-left" variant="standard" onPress={handleBack} />
            <Text variant="titleLarge" style={{ marginLeft: 12 }}>방 만들기</Text>
          </View>

          <View style={{ marginTop: 24 }}>
            <Input
              label="방 이름"
              placeholder="방 이름을 입력하세요"
              value={roomName}
              onChangeText={setRoomName}
              autoFocus
            />
          </View>

          <View style={{ marginTop: 32 }}>
            <Button
              title={isCreating ? '만드는 중...' : '만들기'}
              onPress={handleCreate}
              disabled={!roomName.trim() || isCreating}
              size="lg"
            />
          </View>
        </View>
      </KeyboardAvoidingWrapper>
    </ScreenContainer>
  );
}
