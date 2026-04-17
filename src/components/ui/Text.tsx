import { typeScale, useTheme, type TypeToken } from '@/design';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

// M3 type scale + legacy semantic variants (h1/h2/h3/body/caption)

type LegacyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption';
type TextVariant = TypeToken | LegacyVariant;

const LEGACY_MAP: Record<LegacyVariant, TypeToken> = {
  h1: 'headlineLarge',
  h2: 'headlineMedium',
  h3: 'titleLarge',
  body: 'bodyLarge',
  caption: 'bodySmall',
};

type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: string;
};

export function Text({ variant = 'body', color, style, ...props }: TextProps) {
  const { colors } = useTheme();
  const token: TypeToken =
    (LEGACY_MAP as Record<string, TypeToken>)[variant] ?? (variant as TypeToken);
  const baseColor = variant === 'caption' ? colors.onSurfaceVariant : colors.onSurface;
  return (
    <RNText
      style={[typeScale[token], { color: color ?? baseColor }, style]}
      {...props}
    />
  );
}
