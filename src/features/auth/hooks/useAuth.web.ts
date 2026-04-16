/**
 * 웹 전용 useAuth 훅 (개발/테스트용)
 *
 * Metro 번들러는 .web.ts 파일을 웹 빌드에서 자동으로 우선 사용합니다.
 * - 웹에서는 @react-native-seoul/kakao-login을 import하지 않으므로 import.meta 에러 해결
 * - 웹 개발 시 목업 로그인 버튼으로 테스트 계정 선택
 * - 안드로이드 빌드 시에는 useAuth.ts 가 사용됩니다.
 */
import { useAuthStore } from '@/src/stores/authStore';
import { useEffect, useState } from 'react';
import { authApi } from '../api/authApi';

export function useAuth() {
  const { user, isLoggedIn, isHydrated, setAuth, logout, setHydrated } =
    useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithKakao = async () => {
    console.warn('웹 환경에서는 카카오 로그인을 사용할 수 없습니다. 목업 로그인을 사용하세요.');
  };

  const loginWithMock = async (nickname: string) => {
    try {
      setIsLoading(true);
      const result = await authApi.loginWithMock(nickname);
      setAuth(result.user, result.accessToken, result.refreshToken);
      setHydrated(true);
    } catch (error) {
      console.error('목업 로그인 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoggedIn, isHydrated, isLoading, loginWithKakao, loginWithMock, logout };
}
