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
  if (Platform.OS !== 'ios') return null;

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
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
