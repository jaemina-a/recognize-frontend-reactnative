import { CONFIG } from '@/src/constants/config';
import { useAuthStore } from '@/src/stores/authStore';
import { ENDPOINTS } from './endpoints';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const { token, refreshToken, updateAccessToken, logout } =
    useAuthStore.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 401이면 토큰 갱신 시도
  if (response.status === 401 && refreshToken) {
    const refreshRes = await fetch(
      `${CONFIG.API_URL}${ENDPOINTS.AUTH_REFRESH}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      },
    );

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      updateAccessToken(data.accessToken);

      headers['Authorization'] = `Bearer ${data.accessToken}`;
      response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      logout();
      throw new Error('세션이 만료되었습니다.');
    }
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
