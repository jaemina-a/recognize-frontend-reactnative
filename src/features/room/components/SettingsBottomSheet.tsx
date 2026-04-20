import { BottomSheet, Button, Text } from '@/src/components/ui';
import { InviteCodeCard } from './InviteCodeModal';
import { MemberList } from './MemberList';
import { roomApi } from '../api/roomApi';
import type { RoomMember } from '../types/room.types';
import { useRoomPreferencesStore } from '@/src/stores/roomPreferencesStore';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, View } from 'react-native';
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
  const feedMode = useRoomPreferencesStore((s) => s.prefsByRoom[roomId]?.feedMode ?? 'vertical');
  const setFeedMode = useRoomPreferencesStore((s) => s.setFeedMode);

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

        {/* 피드 보기 모드 */}
        <View style={{ marginTop: 24 }}>
          <Text variant="labelLarge" style={{ marginBottom: 12 }}>
            피드 보기
          </Text>
          <FeedModeOption
            label="세로 카드"
            description="사진 카드들을 세로로 스크롤"
            selected={feedMode === 'vertical'}
            onPress={() => setFeedMode(roomId, 'vertical')}
          />
          <View style={{ height: 8 }} />
          <FeedModeOption
            label="스토리 풀스크린"
            description="한 장씩 좌우로 넘겨보기"
            selected={feedMode === 'story'}
            onPress={() => setFeedMode(roomId, 'story')}
          />
        </View>

        {/* 방 나가기 */}
        <View style={{ marginTop: 16 }}>
          <Button title="방 나가기" variant="text" onPress={handleLeave} />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

function FeedModeOption({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: selected ? '#111' : 'rgba(0,0,0,0.12)',
        backgroundColor: selected ? 'rgba(0,0,0,0.04)' : 'transparent',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 2,
          borderColor: selected ? '#111' : 'rgba(0,0,0,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        {selected && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#111',
            }}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="labelLarge">{label}</Text>
        <Text variant="bodySmall" style={{ opacity: 0.6, marginTop: 2 }}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}
