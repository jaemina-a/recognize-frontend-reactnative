import { elevation, shape, useTheme } from '@/design';
import { View, type ViewProps } from 'react-native';

// M3 Card — filled | elevated | outlined

type CardVariant = 'filled' | 'elevated' | 'outlined';

type CardProps = ViewProps & {
  variant?: CardVariant;
  padding?: number;
};

export function Card({ variant = 'elevated', padding = 16, style, ...props }: CardProps) {
  const { colors } = useTheme();

  const variantStyle = (() => {
    switch (variant) {
      case 'filled':
        return { backgroundColor: colors.surfaceContainerHighest, borderWidth: 0, borderColor: 'transparent', elev: 0 as const };
      case 'outlined':
        return { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, elev: 0 as const };
      case 'elevated':
      default:
        return { backgroundColor: colors.surfaceContainerLow, borderWidth: 0, borderColor: 'transparent', elev: 1 as const };
    }
  })();

  return (
    <View
      style={[
        {
          backgroundColor: variantStyle.backgroundColor,
          borderWidth: variantStyle.borderWidth,
          borderColor: variantStyle.borderColor,
          borderRadius: shape.medium,
          padding,
        },
        variantStyle.elev > 0 && elevation(variantStyle.elev),
        style,
      ]}
      {...props}
    />
  );
}
