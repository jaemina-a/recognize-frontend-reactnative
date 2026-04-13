// TODO: 방 상세 데이터 훅
import type { Room } from '../types/room.types';

const DUMMY_ROOM: Room = {
  id: '1',
  name: '갓생 인증방 🔥',
  inviteCode: 'ABC123',
  ownerId: 'user1',
  members: [
    { userId: 'user1', nickname: '재민', profileImage: null, totalScore: 5 },
    { userId: 'user2', nickname: '민수', profileImage: null, totalScore: 3 },
    { userId: 'user3', nickname: '지은', profileImage: null, totalScore: 7 },
  ],
  createdAt: '2026-04-10T09:00:00Z',
};

export function useRoom(roomId: string) {
  // TODO: API 연동
  return {
    room: DUMMY_ROOM,
    isLoading: false,
    refetch: () => {},
  };
}
