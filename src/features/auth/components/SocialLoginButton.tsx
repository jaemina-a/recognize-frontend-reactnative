import { Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

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

  // 정적 스타일은 StyleSheet으로 분리. Pressable의 function-as-style 안에 backgroundColor/borderRadius 등
  // 시각적 속성을 두면 일부 Android(Fabric) 환경에서 적용이 누락되는 사례가 있어, opacity만 동적으로 처리한다.
  const containerStyle = {
    backgroundColor: bg,
    borderWidth: border === 'transparent' ? 0 : 1,
    borderColor: border,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      cssInterop={false}
      style={({ pressed }) => [
        styles.base,
        containerStyle,
        { opacity: disabled ? 0.38 : pressed ? 0.88 : 1 },
      ]}
    >
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons name={iconName} size={20} color={fg} />
      </View>
      <Text variant="labelLarge" color={fg}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    // Android Fabric에서 borderRadius:9999는 일부 환경에서 렌더 누락이 발생할 수 있어 minHeight 절반값 사용
    borderRadius: 26,
    marginBottom: 12,
    minHeight: 52,
  },
  iconWrapper: {
    marginRight: 10,
  },
});
