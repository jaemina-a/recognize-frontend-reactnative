// TODO: 토스트 알림 구현
import { View } from 'react-native';
import { Text } from '../ui/Text';

type ToastProps = {
  message: string;
  visible: boolean;
};

export function Toast({ message, visible }: ToastProps) {
  if (!visible) return null;

  return (
    <View className="absolute bottom-10 left-6 right-6 bg-black rounded-lg p-4">
      <Text className="text-white text-center">{message}</Text>
    </View>
  );
}
