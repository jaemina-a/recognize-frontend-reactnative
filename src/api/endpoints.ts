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

  // Photos
  PHOTOS: (roomId: string) => `/rooms/${roomId}/photos`,
  CALENDAR: (roomId: string) => `/rooms/${roomId}/calendar`,
  PHOTOS_BY_DATE: (roomId: string) => `/rooms/${roomId}/photos/by-date`,

  // Chat
  CHAT_ROOM: (roomId: string) => `/rooms/${roomId}/chat`,
  CHAT_MESSAGES: (roomId: string) => `/rooms/${roomId}/chat/messages`,
  CHAT_READ: (roomId: string) => `/rooms/${roomId}/chat/read`,
} as const;
