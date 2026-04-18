import { Button, Input } from '@/src/components/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { roomApi } from '../api/roomApi';

type Props = {
  /** 방 생성 성공 직후 호출 (모달 닫기 등). */
  onSuccess?: () => void;
};

/**
 * BottomSheet 등 모달 컨텐츠로 사용하는 방 만들기 폼.
 * 외곽 컨테이너(SafeArea/AppBar)는 호출자가 책임진다.
 */
export function CreateRoomFormContent({ onSuccess }: Props) {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!roomName.trim()) return;
    try {
      setIsCreating(true);
      const room = await roomApi.createRoom(roomName.trim());
      onSuccess?.();
      router.push(`/room/${room.id}` as any);
    } catch (e) {
      console.error('[CreateRoom] error:', e);
      Alert.alert('오류', '방 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}>
      <Input
        label="방 이름"
        placeholder="방 이름을 입력하세요"
        value={roomName}
        onChangeText={setRoomName}
        autoFocus
      />
      <View style={{ marginTop: 24 }}>
        <Button
          title={isCreating ? '만드는 중...' : '만들기'}
          onPress={handleCreate}
          disabled={!roomName.trim() || isCreating}
          size="lg"
        />
      </View>
    </View>
  );
}
