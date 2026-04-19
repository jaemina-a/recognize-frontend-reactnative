export const ENDPOINTS = {
  // Auth
  AUTH_KAKAO: '/auth/kakao',
  AUTH_MOCK: '/auth/mock',
  AUTH_GOOGLE: '/auth/google',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_ME: '/auth/me',
  AUTH_LOGOUT: '/auth/logout',

  // Room
  ROOMS: '/rooms',
  ROOM_DETAIL: (id: string) => `/rooms/${id}`,
  ROOM_JOIN: '/rooms/join',
  ROOM_LEAVE: (id: string) => `/rooms/${id}/leave`,

  // Photos & Recognition
  PHOTOS: (roomId: string) => `/rooms/${roomId}/photos`,
  RECOGNIZE: (photoId: string) => `/photos/${photoId}/recognize`,
  CALENDAR: (roomId: string) => `/rooms/${roomId}/calendar`,

  // Chat
  CHAT_ROOM: (roomId: string) => `/rooms/${roomId}/chat`,
  CHAT_MESSAGES: (roomId: string) => `/rooms/${roomId}/chat/messages`,
  CHAT_READ: (roomId: string) => `/rooms/${roomId}/chat/read`,
} as const;
