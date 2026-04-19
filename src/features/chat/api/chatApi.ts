import { apiClient } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';
import type { ChatRoom, MessagesPage } from '../types/chat.types';

export const chatApi = {
  getChatRoom: (roomId: string) =>
    apiClient<ChatRoom>(ENDPOINTS.CHAT_ROOM(roomId), { method: 'GET' }),

  getMessages: (roomId: string, cursor?: string, limit = 30) => {
    const qs = new URLSearchParams();
    if (cursor) qs.set('cursor', cursor);
    qs.set('limit', String(limit));
    return apiClient<MessagesPage>(
      `${ENDPOINTS.CHAT_MESSAGES(roomId)}?${qs.toString()}`,
      { method: 'GET' },
    );
  },

  markRead: (roomId: string, lastReadId?: string) =>
    apiClient<{ lastReadId: string | null; lastReadAt: string }>(
      ENDPOINTS.CHAT_READ(roomId),
      {
        method: 'POST',
        body: JSON.stringify(lastReadId ? { lastReadId } : {}),
      },
    ),
};
