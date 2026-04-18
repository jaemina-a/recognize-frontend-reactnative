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
  // color prop이 명시되지 않으면 inline color를 비워 NativeWind className(text-*)이 적용될 수 있도록 한다.
  // className/style 모두 미지정 시에만 baseColor를 fallback으로 사용.
  const hasClassName = (props as { className?: string }).className != null;
  const baseColor = variant === 'caption' ? colors.onSurfaceVariant : colors.onSurface;
  const resolvedColor = color ?? (hasClassName ? undefined : baseColor);
  return (
    <RNText
      style={[typeScale[token], resolvedColor ? { color: resolvedColor } : null, style]}
      {...props}
    />
  );
}
