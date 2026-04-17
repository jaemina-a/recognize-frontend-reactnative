import { ScreenContainer } from '@/src/components/layout';
import { Button, Divider, Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import { Alert, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { LoginHeader } from './LoginHeader';
import { SocialLoginButton } from './SocialLoginButton';

const MOCK_USERS = ['재민', '아란', '흥희', '은순'] as const;

export function LoginScreen() {
  const { isLoading, loginWithKakao, loginWithMock } = useAuth();
  const { colors } = useTheme();

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
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <LoginHeader />
        <View>
          <SocialLoginButton provider="kakao" onPress={handleKakaoLogin} disabled={isLoading} />
          <SocialLoginButton provider="google" onPress={handleGoogleLogin} />
        </View>

        <View style={{ marginTop: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flex: 1 }}><Divider /></View>
            <Text variant="labelMedium" color={colors.onSurfaceVariant} style={{ marginHorizontal: 12 }}>
              테스트 계정
            </Text>
            <View style={{ flex: 1 }}><Divider /></View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {MOCK_USERS.map((name) => (
              <View key={name} style={{ flexBasis: '47%', flexGrow: 1 }}>
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
