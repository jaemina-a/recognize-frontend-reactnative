import { useCallback, useEffect, useState } from 'react';
import { roomApi } from '../api/roomApi';
import type { Room } from '../types/room.types';

export function useRoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await roomApi.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('방 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { rooms, isLoading, refetch };
}
