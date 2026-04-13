import { Pressable, Modal as RNModal, View, type ModalProps as RNModalProps } from 'react-native';
import { Text } from './Text';

type ModalProps = RNModalProps & {
  title?: string;
  onClose: () => void;
};

export function Modal({ title, onClose, children, ...props }: ModalProps) {
  return (
    <RNModal transparent animationType="fade" {...props}>
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl w-full p-5">
          {title && (
            <View className="flex-row justify-between items-center mb-4">
              <Text variant="h3">{title}</Text>
              <Pressable onPress={onClose}>
                <Text className="text-2xl text-gray-500">✕</Text>
              </Pressable>
            </View>
          )}
          {children}
        </View>
      </View>
    </RNModal>
  );
}
