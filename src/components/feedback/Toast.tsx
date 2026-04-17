import { elevation, shape, useTheme } from '@/design';
import { View } from 'react-native';
import { Text } from '../ui/Text';

type ToastProps = {
  message: string;
  visible: boolean;
};

export function Toast({ message, visible }: ToastProps) {
  const { colors } = useTheme();
  if (!visible) return null;
  return (
    <View
      style={[
        {
          position: 'absolute',
          bottom: 40,
          left: 24,
          right: 24,
          backgroundColor: colors.inverseSurface,
          borderRadius: shape.extraSmall,
          paddingHorizontal: 16,
          paddingVertical: 14,
        },
        elevation(3),
      ]}
    >
      <Text variant="bodyMedium" color={colors.inverseOnSurface} style={{ textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  );
}
