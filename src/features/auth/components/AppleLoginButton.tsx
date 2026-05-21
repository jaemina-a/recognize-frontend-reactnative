import { useTheme } from '@/design';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform, StyleSheet } from 'react-native';

type Props = {
  onPress: () => void;
  disabled?: boolean;
};

/**
 * Apple 공식 Sign in with Apple 버튼.
 * - iOS 외 플랫폼에서는 렌더링하지 않는다.
 * - 디자인은 Apple HIG 가이드에 맞춘 공식 컴포넌트를 그대로 사용 (커스텀 금지).
 */
export function AppleLoginButton({ onPress, disabled }: Props) {
  const { isDark } = useTheme();
  if (Platform.OS !== 'ios') return null;

  // 다크 배경(#0A0A0A)에서 BLACK 버튼은 배경에 묻혀 "배경/테두리가 없어 보인다"는 App Store 심사 4번 지적 사유. 배경 대비 명확한 스타일을 자동 선택한다.
  const buttonStyle = isDark
    ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
    : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK;

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={buttonStyle}
      cornerRadius={12}
      style={[styles.button, disabled ? styles.disabled : null]}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 52,
  },
  disabled: {
    opacity: 0.5,
  },
});
