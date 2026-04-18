import { BottomSheet } from '@/src/components/ui';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { CreateRoomFormContent } from '@/src/features/room/components/CreateRoomFormContent';

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * 방 만들기 BottomSheet.
 * - 좌측 상단 "취소" 텍스트 / 드래그 다운 / 스크림 탭으로 닫힘.
 * - 키보드가 입력창을 가리지 않도록 KeyboardAvoidingView로 감쌈.
 */
export function CreateRoomSheet({ visible, onClose }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} showCancelHeader title="방 만들기">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View>
          <CreateRoomFormContent onSuccess={onClose} />
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}
