import { shape, useTheme } from '@/design';
import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { Text } from './Text';

// M3 Outlined TextField (approximation)

type InputProps = TextInputProps & {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  helperText?: string;
  error?: boolean;
};

export function Input({
  size = 'md',
  label,
  helperText,
  error,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const padding = size === 'sm' ? 10 : size === 'lg' ? 18 : 14;
  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  const borderColor = error
    ? colors.error
    : focused
    ? colors.primary
    : colors.outline;

  return (
    <View>
      {label ? (
        <Text variant="bodySmall" color={focused ? colors.primary : colors.onSurfaceVariant} style={{ marginBottom: 4 }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        {...props}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor={colors.onSurfaceVariant}
        style={[
          {
            borderWidth: focused ? 2 : 1,
            borderColor,
            borderRadius: shape.extraSmall,
            paddingVertical: padding,
            paddingHorizontal: 16,
            fontSize,
            color: colors.onSurface,
            backgroundColor: colors.surface,
          },
          style,
        ]}
      />
      {helperText ? (
        <Text variant="bodySmall" color={error ? colors.error : colors.onSurfaceVariant} style={{ marginTop: 4 }}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
