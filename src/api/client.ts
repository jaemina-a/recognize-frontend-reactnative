// TODO: axios 또는 fetch 기반 HTTP 클라이언트 설정
// 와이어프레임 단계에서는 placeholder

const BASE_URL = 'https://api.example.com'; // TODO: 실제 API URL로 교체

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      // TODO: Authorization 헤더 추가 (interceptors.ts에서 처리)
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
