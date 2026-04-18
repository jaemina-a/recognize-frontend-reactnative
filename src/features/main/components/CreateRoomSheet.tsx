import { BottomSheet } from '@/src/components/ui';
import { CreateRoomFormContent } from '@/src/features/room/components/CreateRoomFormContent';

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * 방 만들기 BottomSheet.
 * - 좌측 상단 "취소" 텍스트 / 드래그 다운 / 스크림 탭으로 닫힘.
 * - 키보드 회피는 BottomSheet 자체가 처리.
 */
export function CreateRoomSheet({ visible, onClose }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} showCancelHeader title="방 만들기">
      <CreateRoomFormContent onSuccess={onClose} />
    </BottomSheet>
  );
}
