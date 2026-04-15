import { ScreenContainer } from '@/src/components/layout';
import { Alert, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { LoginHeader } from './LoginHeader';
import { SocialLoginButton } from './SocialLoginButton';

export function LoginScreen() {
  const { isLoading, loginWithKakao } = useAuth();

  const handleKakaoLogin = async () => {
    try {
      await loginWithKakao();
    } catch (error: any) {
      if (error?.code !== 'E_CANCELLED_OPERATION') {
        Alert.alert('로그인 실패', '카카오 로그인 중 오류가 발생했습니다.');
      }
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('준비 중', '구글 로그인은 준비 중입니다.');
  };

  return (
    <ScreenContainer>
      <View className="flex-1 justify-center px-6">
        <LoginHeader />
        <View>
          <SocialLoginButton
            provider="kakao"
            onPress={handleKakaoLogin}
            disabled={isLoading}
          />
          <SocialLoginButton provider="google" onPress={handleGoogleLogin} />
        </View>
      </View>
    </ScreenContainer>
  );
}
