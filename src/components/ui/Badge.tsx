import { View } from 'react-native';
import { Text } from './Text';

type BadgeProps = {
  label: string;
  className?: string;
};

export function Badge({ label, className = '' }: BadgeProps) {
  return (
    <View className={`bg-black rounded-full px-2 py-0.5 ${className}`}>
      <Text className="text-white text-xs font-semibold">{label}</Text>
    </View>
  );
}
