import { Text } from '@/src/components/ui';
import { shape, useTheme } from '@/design';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

type SocialLoginButtonProps = {
  provider: 'kakao' | 'google';
  onPress: () => void;
  disabled?: boolean;
};

export function SocialLoginButton({ provider, onPress, disabled }: SocialLoginButtonProps) {
  const { colors } = useTheme();
  const label = provider === 'kakao' ? '카카오로 시작하기' : 'Google로 시작하기';
  const bg = provider === 'kakao' ? '#FEE500' : colors.surface;
  const fg = provider === 'kakao' ? '#000000' : colors.onSurface;
  const border = provider === 'google' ? colors.outline : 'transparent';
  const iconName = provider === 'kakao' ? 'chat' : 'google';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: shape.full,
        backgroundColor: bg,
        borderWidth: border === 'transparent' ? 0 : 1,
        borderColor: border,
        marginBottom: 12,
        opacity: disabled ? 0.38 : pressed ? 0.88 : 1,
        minHeight: 52,
      })}
    >
      <View style={{ marginRight: 10 }}>
        <MaterialCommunityIcons name={iconName} size={20} color={fg} />
      </View>
      <Text variant="labelLarge" color={fg}>{label}</Text>
    </Pressable>
  );
}
