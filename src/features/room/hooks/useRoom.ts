import { useCallback, useEffect, useState } from 'react';
import { roomApi } from '../api/roomApi';
import type { Room } from '../types/room.types';

const EMPTY_ROOM: Room = {
  id: '',
  name: '',
  inviteCode: '',
  ownerId: '',
  maxMembers: 4,
  members: [],
  createdAt: '',
};

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room>(EMPTY_ROOM);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await roomApi.getRoom(roomId);
      setRoom(data);
    } catch (error) {
      console.error('방 정보 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { room, isLoading, refetch };
}
