import { apiClient } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';
import { CONFIG } from '@/src/constants/config';
import type { User } from '../types/auth.types';

type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export const authApi = {
  loginWithKakao: async (kakaoAccessToken: string): Promise<LoginResponse> => {
    const url = `${CONFIG.API_URL}${ENDPOINTS.AUTH_KAKAO}`;
    console.log('[KAKAO][API] POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: kakaoAccessToken }),
    });

    console.log('[KAKAO][API] response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('[KAKAO][API] error body:', error);
      throw new Error(error || '로그인에 실패했습니다.');
    }

    return response.json();
  },

  loginWithApple: async (params: {
    identityToken: string;
    authorizationCode?: string | null;
    nickname?: string | null;
  }): Promise<LoginResponse> => {
    const url = `${CONFIG.API_URL}${ENDPOINTS.AUTH_APPLE}`;
    console.log('[APPLE][API] POST', url, {
      identityTokenLength: params.identityToken?.length,
      hasAuthorizationCode: !!params.authorizationCode,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identityToken: params.identityToken,
        authorizationCode: params.authorizationCode ?? undefined,
        nickname: params.nickname ?? undefined,
      }),
    });

    console.log('[APPLE][API] response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('[APPLE][API] error body:', error);
      throw new Error(error || 'Apple 로그인에 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 계정 삭제 (인증 필수, JWT는 apiClient가 자동 주입).
   * 백엔드는 204 No Content 응답.
   */
  deleteAccount: async (): Promise<void> => {
    await apiClient<void>(ENDPOINTS.USER_ME, { method: 'DELETE' });
  },
};
