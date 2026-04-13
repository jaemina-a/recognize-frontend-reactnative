import { Pressable, Text, type PressableProps } from 'react-native';

// 네이티브 Pressable 기반 버튼 래퍼
// 크기(size)와 변형(variant)만 조절

type ButtonProps = PressableProps & {
  title: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outlined' | 'ghost';
};

export function Button({
  title,
  size = 'md',
  variant = 'filled',
  className = '',
  ...props
}: ButtonProps) {
  const sizeClass = {
    sm: 'py-2 px-3',
    md: 'py-3 px-5',
    lg: 'py-4 px-6',
  }[size];

  const variantClass = {
    filled: 'bg-black',
    outlined: 'border border-black bg-white',
    ghost: 'bg-transparent',
  }[variant];

  const textColor = {
    filled: 'text-white',
    outlined: 'text-black',
    ghost: 'text-black',
  }[variant];

  return (
    <Pressable
      className={`${sizeClass} ${variantClass} rounded-lg items-center justify-center ${className}`}
      {...props}
    >
      <Text className={`${textColor} font-semibold text-base`}>{title}</Text>
    </Pressable>
  );
}
