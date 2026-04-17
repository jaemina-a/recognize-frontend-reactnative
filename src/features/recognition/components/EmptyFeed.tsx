import { Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

export function EmptyFeed() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 72 }}>
      <MaterialCommunityIcons name="camera-outline" size={56} color={colors.onSurfaceVariant} />
      <Text variant="titleMedium" style={{ marginTop: 16 }}>아직 오늘의 인증이 없어요</Text>
      <Text variant="bodySmall" color={colors.onSurfaceVariant} style={{ marginTop: 4 }}>
        첫 번째로 인증해보세요!
      </Text>
    </View>
  );
}
