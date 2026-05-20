import { Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import { View } from 'react-native';

export function LoginHeader() {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', marginBottom: 48 }}>
      <Text variant="displaySmall" color={colors.primary} style={{ marginBottom: 8, fontWeight: '700' }}>
        Look up
      </Text>
      <Text variant="bodyMedium" color={colors.onSurfaceVariant}>
        
      </Text>
    </View>
  );
}
