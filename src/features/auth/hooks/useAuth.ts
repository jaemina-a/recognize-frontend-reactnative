import { useAuthStore } from '@/src/stores/authStore';
import * as KakaoLogin from '@react-native-seoul/kakao-login';
import { useState } from 'react';
import { authApi } from '../api/authApi';

export function useAuth() {
  const { user, isLoggedIn, isHydrated, setAuth, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const loginWithKakao = async () => {
    try {
      setIsLoading(true);

      // 1. 카카오 SDK로 로그인 → 카카오 액세스 토큰 획득
      const kakaoToken = await KakaoLogin.login();

      // 2. 카카오 토큰을 백엔드로 전송 → 서비스 JWT 발급
      const result = await authApi.loginWithKakao(kakaoToken.accessToken);

      // 3. Zustand 스토어에 저장 (persist → AsyncStorage)
      setAuth(result.user, result.accessToken, result.refreshToken);
    } catch (error: any) {
      if (error?.code !== 'E_CANCELLED_OPERATION') {
        console.error('카카오 로그인 실패:', error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoggedIn, isHydrated, isLoading, loginWithKakao, logout };
}
