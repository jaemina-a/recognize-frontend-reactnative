import { Button, Modal, Text } from '@/src/components/ui';
import { View } from 'react-native';

type InviteCodeModalProps = {
  visible: boolean;
  inviteCode: string;
  onClose: () => void;
};

export function InviteCodeModal({ visible, inviteCode, onClose }: InviteCodeModalProps) {
  return (
    <Modal visible={visible} title="초대코드" onClose={onClose}>
      <View className="items-center py-4">
        <View className="bg-gray-100 rounded-xl px-8 py-4 mb-4">
          <Text variant="h2" className="tracking-widest">{inviteCode}</Text>
        </View>
        <Text variant="caption" className="mb-4">
          이 코드를 친구에게 공유하세요!
        </Text>
        <Button
          title="코드 복사"
          size="sm"
          onPress={() => {
            // TODO: Clipboard 복사
            console.log('코드 복사:', inviteCode);
          }}
        />
      </View>
    </Modal>
  );
}
