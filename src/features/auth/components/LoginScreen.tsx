import { ScreenContainer } from '@/src/components/layout';
import { Button, Text } from '@/src/components/ui';
import { Alert, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { LoginHeader } from './LoginHeader';
import { SocialLoginButton } from './SocialLoginButton';

const MOCK_USERS = ['재민', '아란', '흥희', '은순'] as const;

export function LoginScreen() {
  const { isLoading, loginWithKakao, loginWithMock } = useAuth();

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

  const handleMockLogin = async (nickname: string) => {
    try {
      await loginWithMock(nickname);
    } catch {
      Alert.alert('로그인 실패', '목업 로그인 중 오류가 발생했습니다.');
    }
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

        <View className="mt-8">
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text variant="caption" className="mx-3">테스트 계정</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>
          <View className="flex-row flex-wrap gap-3">
            {MOCK_USERS.map((name) => (
              <View key={name} className="flex-1 min-w-[45%]">
                <Button
                  title={`${name}으로 로그인`}
                  variant="outlined"
                  size="sm"
                  onPress={() => handleMockLogin(name)}
                  disabled={isLoading}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
