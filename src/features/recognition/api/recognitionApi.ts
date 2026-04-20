import { CONFIG } from '@/src/constants/config';
import { ENDPOINTS } from '@/src/api/endpoints';
import { useAuthStore } from '@/src/stores/authStore';
import { apiClient } from '@/src/api/client';
import type {
  CalendarDay,
  Recognition,
} from '../types/recognition.types';
import { Platform } from 'react-native';

export const recognitionApi = {
  getFeed: async (roomId: string): Promise<Recognition[]> => {
    return apiClient<Recognition[]>(ENDPOINTS.PHOTOS(roomId));
  },

  uploadPhoto: async (roomId: string, photoUri: string): Promise<Recognition> => {
    const { token } = useAuthStore.getState();
    const formData = new FormData();
    const filename = photoUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    if (Platform.OS === 'web') {
      const res = await fetch(photoUri);
      const blob = await res.blob();
      formData.append('photo', blob, filename);
    } else {
      formData.append('photo', {
        uri: photoUri,
        name: filename,
        type,
      } as any);
    }

    const response = await fetch(`${CONFIG.API_URL}${ENDPOINTS.PHOTOS(roomId)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  },

  getCalendar: async (roomId: string, year: number, month: number): Promise<CalendarDay[]> => {
    return apiClient<CalendarDay[]>(
      `${ENDPOINTS.CALENDAR(roomId)}?year=${year}&month=${month}`,
    );
  },

  getPhotosByDate: async (roomId: string, date: string): Promise<Recognition[]> => {
    return apiClient<Recognition[]>(
      `${ENDPOINTS.PHOTOS_BY_DATE(roomId)}?date=${date}`,
    );
  },
};
