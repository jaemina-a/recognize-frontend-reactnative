import { ScreenContainer } from '@/src/components/layout';
import { View } from 'react-native';
import { LoginHeader } from './LoginHeader';
import { SocialLoginButton } from './SocialLoginButton';

export function LoginScreen() {
  // TODO: 실제 소셜 로그인 연동
  const handleKakaoLogin = () => {
    console.log('카카오 로그인');
  };

  const handleGoogleLogin = () => {
    console.log('구글 로그인');
  };

  return (
    <ScreenContainer>
      <View className="flex-1 justify-center px-6">
        <LoginHeader />
        <View>
          <SocialLoginButton provider="kakao" onPress={handleKakaoLogin} />
          <SocialLoginButton provider="google" onPress={handleGoogleLogin} />
        </View>
      </View>
    </ScreenContainer>
  );
}
