import { CONFIG } from '@/src/constants/config';
import type { User } from '../types/auth.types';

type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export const authApi = {
  loginWithKakao: async (kakaoAccessToken: string): Promise<LoginResponse> => {
    const response = await fetch(`${CONFIG.API_URL}/auth/kakao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: kakaoAccessToken }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || '로그인에 실패했습니다.');
    }

    return response.json();
  },
};
