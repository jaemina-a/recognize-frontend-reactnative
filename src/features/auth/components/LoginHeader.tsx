import { Text } from '@/src/components/ui';
import { View } from 'react-native';

export function LoginHeader() {
  return (
    <View className="items-center mb-12">
      <Text variant="h1" className="mb-2">Recognizer</Text>
      <Text variant="caption">서로의 갓생을 인정해주는 공간</Text>
    </View>
  );
}
