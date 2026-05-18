import { ScreenContainer } from '@/src/components/layout';
import { Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { LoginHeader } from './LoginHeader';
import { SocialLoginButton } from './SocialLoginButton';

const MOCK_NICKNAMES = ['지우', '서연', '도윤', '하은'] as const;
// 스크린샷 작업 동안은 무조건 노출. 작업 끝나면 false 또는 EXPO_PUBLIC_ 토글로 환원.
const MOCK_LOGIN_ENABLED = true;

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

  const handleMockLogin = async (nickname: string) => {
    try {
      await loginWithMock(nickname);
    } catch {
      Alert.alert('로그인 실패', `${nickname} 목업 로그인에 실패했습니다.`);
    }
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <LoginHeader />
        <View>
          <SocialLoginButton provider="kakao" onPress={handleKakaoLogin} disabled={isLoading} />
        </View>

        {MOCK_LOGIN_ENABLED && (
          <View style={[styles.mockSection, { borderColor: colors.outlineVariant }]}>
            <Text variant="labelSmall" color={colors.onSurfaceVariant} style={styles.mockLabel}>
              개발용 빠른 로그인
            </Text>
            <View style={styles.mockGrid}>
              {MOCK_NICKNAMES.map((nickname) => (
                <Pressable
                  key={nickname}
                  onPress={() => handleMockLogin(nickname)}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.mockButton,
                    {
                      backgroundColor: colors.surfaceContainerHigh,
                      borderColor: colors.outlineVariant,
                      opacity: isLoading ? 0.38 : pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text variant="labelLarge" color={colors.onSurface}>
                    {nickname}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mockSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
  },
  mockLabel: {
    textAlign: 'center',
    marginBottom: 12,
  },
  mockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  mockButton: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
