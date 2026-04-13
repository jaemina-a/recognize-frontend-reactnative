import { TextInput, type TextInputProps } from 'react-native';

// 네이티브 TextInput 래퍼 — 크기만 조절

type InputProps = TextInputProps & {
  size?: 'sm' | 'md' | 'lg';
};

export function Input({ size = 'md', className = '', ...props }: InputProps) {
  const sizeClass = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4 text-base',
    lg: 'py-4 px-5 text-lg',
  }[size];

  return (
    <TextInput
      className={`border border-gray-300 rounded-lg bg-white text-black ${sizeClass} ${className}`}
      placeholderTextColor="#9E9E9E"
      {...props}
    />
  );
}
