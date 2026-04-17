import { Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import { View } from 'react-native';

export function LoginHeader() {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', marginBottom: 48 }}>
      <Text variant="displaySmall" color={colors.primary} style={{ marginBottom: 8, fontWeight: '700' }}>
        recognizer
      </Text>
      <Text variant="bodyMedium" color={colors.onSurfaceVariant}>
        서로의 갓생을 인정해주는 공간
      </Text>
    </View>
  );
}
