// TODO: 방 목록 데이터 훅
import type { Room } from '../types/room.types';

// 와이어프레임용 더미 데이터
const DUMMY_ROOMS: Room[] = [
  {
    id: '1',
    name: '갓생 인증방 🔥',
    inviteCode: 'ABC123',
    ownerId: 'user1',
    members: [
      { userId: 'user1', nickname: '재민', profileImage: null, totalScore: 5 },
      { userId: 'user2', nickname: '민수', profileImage: null, totalScore: 3 },
    ],
    createdAt: '2026-04-10T09:00:00Z',
  },
  {
    id: '2',
    name: '운동 인증 💪',
    inviteCode: 'DEF456',
    ownerId: 'user1',
    members: [
      { userId: 'user1', nickname: '재민', profileImage: null, totalScore: 2 },
    ],
    createdAt: '2026-04-12T14:00:00Z',
  },
];

export function useRoomList() {
  // TODO: API 연동
  return {
    rooms: DUMMY_ROOMS,
    isLoading: false,
    refetch: () => {},
  };
}
