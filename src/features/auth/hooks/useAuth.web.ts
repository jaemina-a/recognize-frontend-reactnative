/**
 * 웹 전용 useAuth 훅 (개발/테스트용)
 *
 * Metro 번들러는 .web.ts 파일을 웹 빌드에서 자동으로 우선 사용합니다.
 * - 웹에서는 네이티브 로그인 (카카오/Apple) 자체가 지원되지 않는다.
 */
import { useAuthStore } from '@/src/stores/authStore';
import { useEffect, useState } from 'react';

export function useAuth() {
  const { user, isLoggedIn, isHydrated, logout, setHydrated } = useAuthStore();
  const [isLoading] = useState(false);

  useEffect(() => {
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithKakao = async () => {
    console.warn('웹 환경에서는 카카오 로그인을 사용할 수 없습니다.');
  };

  const loginWithApple = async () => {
    console.warn('웹 환경에서는 Apple 로그인을 사용할 수 없습니다.');
  };

  const deleteAccount = async () => {
    console.warn('웹 환경에서는 계정 삭제를 사용할 수 없습니다.');
  };

  return {
    user,
    isLoggedIn,
    isHydrated,
    isLoading,
    loginWithKakao,
    loginWithApple,
    logout,
    deleteAccount,
  };
}
