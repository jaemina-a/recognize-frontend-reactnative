import { View, type ViewProps } from 'react-native';

// 기본 카드 컨테이너

type CardProps = ViewProps;

export function Card({ className = '', ...props }: CardProps) {
  return (
    <View
      className={`bg-white border border-gray-200 rounded-xl p-4 ${className}`}
      {...props}
    />
  );
}
