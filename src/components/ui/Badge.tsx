import { shape, useTheme } from '@/design';
import { View, type ViewStyle } from 'react-native';
import { Text } from './Text';

type BadgeVariant = 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
};

export function Badge({ label, variant = 'primary', style }: BadgeProps) {
  const { colors } = useTheme();
  const map = {
    primary: { bg: colors.primaryContainer, fg: colors.onPrimaryContainer },
    secondary: { bg: colors.secondaryContainer, fg: colors.onSecondaryContainer },
    tertiary: { bg: colors.tertiaryContainer, fg: colors.onTertiaryContainer },
    error: { bg: colors.errorContainer, fg: colors.onErrorContainer },
    neutral: { bg: colors.surfaceContainerHigh, fg: colors.onSurface },
  }[variant];

  return (
    <View
      style={[
        {
          backgroundColor: map.bg,
          borderRadius: shape.full,
          paddingHorizontal: 10,
          paddingVertical: 3,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text variant="labelSmall" color={map.fg}>{label}</Text>
    </View>
  );
}
