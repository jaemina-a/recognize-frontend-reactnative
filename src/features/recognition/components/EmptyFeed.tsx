import { Text } from '@/src/components/ui';
import { View } from 'react-native';

export function EmptyFeed() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-4xl mb-4">📷</Text>
      <Text variant="h3" className="mb-2">아직 오늘의 인증이 없어요</Text>
      <Text variant="caption">첫 번째로 갓생을 인증해보세요!</Text>
    </View>
  );
}
