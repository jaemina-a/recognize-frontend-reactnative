import { useTheme } from '@/design';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, type PressableProps } from 'react-native';

// M3 Icon Button — standard | filled | tonal | outlined
// https://m3.material.io/components/icon-buttons/overview

type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: IconName;
  variant?: IconButtonVariant;
  size?: number;
  iconSize?: number;
  color?: string;
};

export function IconButton({
  icon,
  variant = 'standard',
  size = 40,
  iconSize,
  color,
  disabled,
  ...props
}: IconButtonProps) {
  const { colors } = useTheme();
  const resolvedIconSize = iconSize ?? Math.round(size * 0.6);

  const style = (() => {
    switch (variant) {
      case 'filled':
        return { bg: colors.primary, fg: colors.onPrimary, border: 'transparent' };
      case 'tonal':
        return { bg: colors.secondaryContainer, fg: colors.onSecondaryContainer, border: 'transparent' };
      case 'outlined':
        return { bg: 'transparent', fg: colors.onSurfaceVariant, border: colors.outline };
      case 'standard':
      default:
        return { bg: colors.surfaceContainerHigh, fg: colors.onSurfaceVariant, border: 'transparent' };
    }
  })();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: style.bg,
        borderColor: style.border,
        borderWidth: variant === 'outlined' ? 1 : 0,
        opacity: disabled ? 0.38 : pressed ? 0.85 : 1,
      })}
      hitSlop={6}
      {...props}
    >
      <MaterialCommunityIcons name={icon} size={resolvedIconSize} color={color ?? style.fg} />
    </Pressable>
  );
}
