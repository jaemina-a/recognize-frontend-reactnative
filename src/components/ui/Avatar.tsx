import { View } from 'react-native';
import { Text } from './Text';

// 유저 아바타 — 이니셜 기반 원형

type AvatarProps = {
  name: string;
  size?: number;
  className?: string;
};

export function Avatar({ name, size = 40, className = '' }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <View
      className={`bg-gray-200 rounded-full items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Text className="text-black font-semibold" style={{ fontSize: size * 0.4 }}>
        {initial}
      </Text>
    </View>
  );
}
