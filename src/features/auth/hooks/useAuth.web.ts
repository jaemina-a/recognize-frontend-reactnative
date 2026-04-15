/**
 * 웹 전용 useAuth 훅 (개발/테스트용 목업)
 *
 * Metro 번들러는 .web.ts 파일을 웹 빌드에서 자동으로 우선 사용합니다.
 * - 웹에서는 @react-native-seoul/kakao-login을 import하지 않으므로 import.meta 에러 해결
 * - 웹 개발 시 항상 로그인된 상태로 시작 (목업 유저 자동 주입)
 * - 안드로이드 빌드 시에는 useAuth.ts 가 사용됩니다.
 */
import type { User } from '@/src/features/auth/types/auth.types';
import { useAuthStore } from '@/src/stores/authStore';
import { useEffect, useState } from 'react';

const MOCK_USER: User = {
  id: 'mock-user-001',
  nickname: '개발자',
  profileImage: null,
  provider: 'kakao',
};

export function useAuth() {
  const { user, isLoggedIn, isHydrated, setAuth, logout, setHydrated } =
    useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // 웹 개발 환경: 마운트 시 자동으로 목업 로그인 상태 주입
  useEffect(() => {
    if (!isLoggedIn) {
      setAuth(MOCK_USER, 'mock-access-token', 'mock-refresh-token');
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithKakao = async () => {
    setIsLoading(true);
    setAuth(MOCK_USER, 'mock-access-token', 'mock-refresh-token');
    setHydrated(true);
    setIsLoading(false);
  };

  return { user, isLoggedIn, isHydrated, isLoading, loginWithKakao, logout };
}
