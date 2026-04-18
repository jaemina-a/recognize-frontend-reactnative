import { elevation, shape, useTheme } from '@/design';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../ui/Text';

type ToastProps = {
  message: string;
  visible: boolean;
};

export function Toast({ message, visible }: ToastProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  if (!visible) return null;
  return (
    <View
      style={[
        {
          position: 'absolute',
          // edge-to-edge 모드(Android)에서 네비게이션 바와 겹치지 않도록 safe area inset 보정
          bottom: 40 + insets.bottom,
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
