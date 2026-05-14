import { CONFIG } from '@/src/constants/config';
import type { User } from '../types/auth.types';

type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export const authApi = {
  loginWithKakao: async (kakaoAccessToken: string): Promise<LoginResponse> => {
    const url = `${CONFIG.API_URL}/auth/kakao`;
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

  loginWithMock: async (nickname: string): Promise<LoginResponse> => {
    const response = await fetch(`${CONFIG.API_URL}/auth/mock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || '목업 로그인에 실패했습니다.');
    }

    return response.json();
  },
};
