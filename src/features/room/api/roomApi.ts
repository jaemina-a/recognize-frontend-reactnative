import { apiClient } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';
import type { Room } from '../types/room.types';

export const roomApi = {
  getRooms: async (): Promise<Room[]> => {
    return apiClient<Room[]>(ENDPOINTS.ROOMS);
  },

  getRoom: async (id: string): Promise<Room> => {
    return apiClient<Room>(ENDPOINTS.ROOM_DETAIL(id));
  },

  createRoom: async (name: string): Promise<Room> => {
    return apiClient<Room>(ENDPOINTS.ROOMS, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  joinRoom: async (inviteCode: string): Promise<Room> => {
    return apiClient<Room>(ENDPOINTS.ROOM_JOIN, {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  },

  leaveRoom: async (id: string): Promise<void> => {
    await apiClient<{ message: string }>(ENDPOINTS.ROOM_LEAVE(id), {
      method: 'DELETE',
    });
  },
};
