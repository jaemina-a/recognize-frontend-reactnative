import { useChatStore } from '@/src/features/chat/stores/chatStore';
import { disconnectChatSocket } from '@/src/features/chat/hooks/useChatSocket';
import { useAuthStore } from '@/src/stores/authStore';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as KakaoLogin from '@react-native-seoul/kakao-login';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { authApi } from '../api/authApi';

export function useAuth() {
  const { user, isLoggedIn, isHydrated, setAuth, logout: storeLogout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const loginWithKakao = async () => {
    try {
      setIsLoading(true);
      console.log('[KAKAO][1] KakaoLogin.login() 호출');

      // 1. 카카오 SDK로 로그인 → 카카오 액세스 토큰 획득
      const kakaoToken = await KakaoLogin.login();
      console.log('[KAKAO][2] kakaoToken 획득 성공', {
        accessTokenLength: kakaoToken.accessToken?.length,
        accessTokenPrefix: kakaoToken.accessToken?.slice(0, 8),
        refreshTokenExpiresAt: kakaoToken.refreshTokenExpiresAt,
      });

      // 2. 카카오 토큰을 백엔드로 전송 → 서비스 JWT 발급
      console.log('[KAKAO][3] 백엔드 /auth/kakao 요청');
      const result = await authApi.loginWithKakao(kakaoToken.accessToken);
      console.log('[KAKAO][4] 백엔드 응답 성공', {
        userId: result.user.id,
        nickname: result.user.nickname,
      });

      // 3. Zustand 스토어에 저장 (persist → AsyncStorage)
      setAuth(result.user, result.accessToken, result.refreshToken);
      console.log('[KAKAO][5] 스토어 저장 완료');
    } catch (error: any) {
      if (error?.code !== 'E_CANCELLED_OPERATION') {
        console.error('[KAKAO][X] 카카오 로그인 실패:', {
          code: error?.code,
          message: error?.message,
          stack: error?.stack,
          raw: JSON.stringify(error),
        });
      } else {
        console.log('[KAKAO][X] 사용자 취소');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async () => {
    if (Platform.OS !== 'ios') {
      throw new Error('Sign in with Apple is only available on iOS');
    }
    try {
      setIsLoading(true);
      console.log('[APPLE][1] AppleAuthentication.signInAsync()');

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple identityToken is missing');
      }

      const fullName = credential.fullName;
      const nickname =
        fullName?.givenName?.trim() ||
        fullName?.familyName?.trim() ||
        undefined;

      console.log('[APPLE][2] 백엔드 /auth/apple 요청', {
        identityTokenLength: credential.identityToken.length,
        hasAuthorizationCode: !!credential.authorizationCode,
        hasNickname: !!nickname,
      });

      const result = await authApi.loginWithApple({
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        nickname,
      });

      console.log('[APPLE][3] 백엔드 응답 성공', {
        userId: result.user.id,
        nickname: result.user.nickname,
      });

      setAuth(result.user, result.accessToken, result.refreshToken);
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED' || error?.code === 'ERR_CANCELED') {
        console.log('[APPLE][X] 사용자 취소');
      } else {
        console.error('[APPLE][X] Apple 로그인 실패:', {
          code: error?.code,
          message: error?.message,
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    // 웹소켓/캐시 정리 후 인증 상태 초기화 (순서 중요)
    disconnectChatSocket();
    useChatStore.setState({
      messagesByRoom: {},
      unreadByRoom: {},
      cursorByRoom: {},
    });
    storeLogout();
  }, [storeLogout]);

  const deleteAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      await authApi.deleteAccount();
      disconnectChatSocket();
      useChatStore.setState({
        messagesByRoom: {},
        unreadByRoom: {},
        cursorByRoom: {},
      });
      storeLogout();
    } finally {
      setIsLoading(false);
    }
  }, [storeLogout]);

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
