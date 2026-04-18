import { BottomSheet } from '@/src/components/ui';
import { JoinRoomFormContent } from '@/src/features/room/components/JoinRoomFormContent';

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * 초대코드 참가 BottomSheet.
 * - 좌측 상단 "취소" 텍스트 / 드래그 다운 / 스크림 탭으로 닫힘.
 * - 키보드 회피는 BottomSheet 자체가 처리.
 */
export function JoinRoomSheet({ visible, onClose }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} showCancelHeader title="방 참가하기">
      <JoinRoomFormContent onSuccess={onClose} />
    </BottomSheet>
  );
}
