export const ENDPOINTS = {
  // Auth
  AUTH_KAKAO: '/auth/kakao',
  AUTH_GOOGLE: '/auth/google',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_ME: '/auth/me',
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
