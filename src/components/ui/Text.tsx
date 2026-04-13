import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

// 네이티브 Text 래퍼 — 타이포그래피 프리셋

type TextProps = RNTextProps & {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
};

export function Text({ variant = 'body', className = '', ...props }: TextProps) {
  const variantClass = {
    h1: 'text-3xl font-bold text-black',
    h2: 'text-2xl font-bold text-black',
    h3: 'text-xl font-semibold text-black',
    body: 'text-base text-black',
    caption: 'text-sm text-gray-500',
  }[variant];

  return <RNText className={`${variantClass} ${className}`} {...props} />;
}
