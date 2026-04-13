// API 엔드포인트 상수
// TODO: 백엔드 API 확정 후 실제 경로 작성

export const ENDPOINTS = {
  // Auth
  AUTH_KAKAO: '/auth/kakao',
  AUTH_GOOGLE: '/auth/google',
  AUTH_LOGOUT: '/auth/logout',

  // Room
  ROOMS: '/rooms',
  ROOM_DETAIL: (id: string) => `/rooms/${id}`,
  ROOM_JOIN: '/rooms/join',
  ROOM_LEAVE: (id: string) => `/rooms/${id}/leave`,

  // Recognition
  RECOGNITIONS: (roomId: string) => `/rooms/${roomId}/recognitions`,
  VOTE: (recognitionId: string) => `/recognitions/${recognitionId}/vote`,
} as const;
