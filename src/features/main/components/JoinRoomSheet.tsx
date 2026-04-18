import { BottomSheet } from '@/src/components/ui';
import { JoinRoomFormContent } from '@/src/features/room/components/JoinRoomFormContent';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * 초대코드 참가 BottomSheet.
 * - 좌측 상단 "취소" 텍스트 / 드래그 다운 / 스크림 탭으로 닫힘.
 * - 키보드가 입력창을 가리지 않도록 KeyboardAvoidingView로 감쌈.
 */
export function JoinRoomSheet({ visible, onClose }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} showCancelHeader title="방 참가하기">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View>
          <JoinRoomFormContent onSuccess={onClose} />
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}
