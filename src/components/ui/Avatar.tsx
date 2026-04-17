import { useTheme } from '@/design';
import { Pressable, View } from 'react-native';
import { Text } from './Text';

type AvatarProps = {
  name: string;
  size?: number;
  color?: string;
  onPress?: () => void;
};

export function Avatar({ name, size = 40, color, onPress }: AvatarProps) {
  const { colors } = useTheme();
  const initial = (name || '?').charAt(0).toUpperCase();
  const bg = color ?? colors.primaryContainer;
  const fg = color ? '#FFFFFF' : colors.onPrimaryContainer;

  const content = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: fg, fontSize: size * 0.42, fontWeight: '600' }}>
        {initial}
      </Text>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress} hitSlop={6}>{content}</Pressable>;
  }
  return content;
}
