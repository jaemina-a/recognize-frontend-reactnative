export const ENDPOINTS = {
  // Auth
  AUTH_KAKAO: '/auth/kakao',
  AUTH_APPLE: '/auth/apple',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_ME: '/auth/me',
  // 로그아웃은 JWT 특성상 서버 엔드포인트 없음 — 클라이언트 토큰 삭제로 처리

  // User
  USER_ME: '/users/me',

  // Room
  ROOMS: '/rooms',
  ROOM_DETAIL: (id: string) => `/rooms/${id}`,
  ROOM_JOIN: '/rooms/join',
  ROOM_LEAVE: (id: string) => `/rooms/${id}/leave`,

  // Photos
  PHOTOS: (roomId: string) => `/rooms/${roomId}/photos`,
  CALENDAR: (roomId: string) => `/rooms/${roomId}/calendar`,
  PHOTOS_BY_DATE: (roomId: string) => `/rooms/${roomId}/photos/by-date`,

  // Chat
  CHAT_ROOM: (roomId: string) => `/rooms/${roomId}/chat`,
  CHAT_MESSAGES: (roomId: string) => `/rooms/${roomId}/chat/messages`,
  CHAT_READ: (roomId: string) => `/rooms/${roomId}/chat/read`,
} as const;
