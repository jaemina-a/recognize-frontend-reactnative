import { elevation, shape, useTheme } from '@/design';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

// Material Design 3 Button
// Variants: filled | tonal | outlined | text | elevated
// https://m3.material.io/components/buttons/overview

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  className?: string;
};

export function Button({
  title,
  size = 'md',
  variant = 'filled',
  icon,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  const sizeStyle = useMemo(() => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 16, minHeight: 32, fontSize: 13 };
      case 'lg': return { paddingVertical: 14, paddingHorizontal: 28, minHeight: 52, fontSize: 16 };
      default:   return { paddingVertical: 10, paddingHorizontal: 24, minHeight: 40, fontSize: 14 };
    }
  }, [size]);

  const variantStyle = useMemo(() => {
    switch (variant) {
      case 'tonal':
        return { bg: colors.secondaryContainer, fg: colors.onSecondaryContainer, border: 'transparent', elev: 0 as const };
      case 'outlined':
        return { bg: 'transparent', fg: colors.primary, border: colors.outline, elev: 0 as const };
      case 'text':
      case 'ghost':
        return { bg: 'transparent', fg: colors.primary, border: 'transparent', elev: 0 as const };
      case 'elevated':
        return { bg: colors.surfaceContainerLow, fg: colors.primary, border: 'transparent', elev: 1 as const };
      case 'filled':
      default:
        return { bg: colors.primary, fg: colors.onPrimary, border: 'transparent', elev: 0 as const };
    }
  }, [variant, colors]);

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      className={className}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
          borderWidth: variant === 'outlined' ? 1 : 0,
          borderRadius: shape.full,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          minHeight: sizeStyle.minHeight,
          opacity: disabled ? 0.38 : pressed ? 0.88 : 1,
        },
        variantStyle.elev > 0 && elevation(variantStyle.elev),
      ]}
      {...props}
    >
      <View style={styles.row}>
        {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
        <Text
          style={{
            color: variantStyle.fg,
            fontSize: sizeStyle.fontSize,
            fontWeight: '600',
            letterSpacing: 0.1,
          }}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
