import { ScreenContainer } from '@/src/components/layout';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { AppleLoginButton } from './AppleLoginButton';
import { LoginHeader } from './LoginHeader';
import { SocialLoginButton } from './SocialLoginButton';

/**
 * 로그인 화면.
 *
 * App Store Review Guideline 4.8 대응:
 * - iOS에서는 Apple 로그인을 카카오 로그인 위(동등 위치)에 노출.
 * - mock/dev 로그인 UI는 제거 (재심사 대비).
 */
export function LoginScreen() {
  const { isLoading, loginWithKakao, loginWithApple } = useAuth();

  const handleKakaoLogin = async () => {
    try {
      await loginWithKakao();
    } catch (error: any) {
      if (error?.code !== 'E_CANCELLED_OPERATION') {
        Alert.alert('로그인 실패', '카카오 로그인 중 오류가 발생했습니다.');
      }
    }
  };

  const handleAppleLogin = async () => {
    try {
      await loginWithApple();
    } catch (error: any) {
      const code = error?.code;
      // 사용자 취소는 조용히 무시
      if (code === 'ERR_REQUEST_CANCELED' || code === 'ERR_CANCELED') return;
      Alert.alert('로그인 실패', 'Apple 로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <LoginHeader />
        <View style={styles.buttonStack}>
          {Platform.OS === 'ios' && (
            <AppleLoginButton onPress={handleAppleLogin} disabled={isLoading} />
          )}
          <SocialLoginButton
            provider="kakao"
            onPress={handleKakaoLogin}
            disabled={isLoading}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonStack: {
    gap: 12,
  },
});
