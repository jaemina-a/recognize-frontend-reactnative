import type { Recognition } from '../types/recognition.types';

// 와이어프레임용 더미 데이터
const DUMMY_FEED: Recognition[] = [
  {
    id: 'r1',
    roomId: '1',
    userId: 'user1',
    nickname: '재민',
    photoUrl: '',
    uploadedAt: '2026-04-13T07:30:00Z',
    votes: [{ voterId: 'user2', value: 'recognize' }],
    recognizedCount: 1,
  },
  {
    id: 'r2',
    roomId: '1',
    userId: 'user2',
    nickname: '민수',
    photoUrl: '',
    uploadedAt: '2026-04-13T12:15:00Z',
    votes: [],
    recognizedCount: 0,
  },
  {
    id: 'r3',
    roomId: '1',
    userId: 'user3',
    nickname: '지은',
    photoUrl: '',
    uploadedAt: '2026-04-13T15:42:00Z',
    votes: [
      { voterId: 'user1', value: 'recognize' },
      { voterId: 'user2', value: 'recognize' },
    ],
    recognizedCount: 2,
  },
];

export function useRecognitionFeed(roomId: string) {
  // TODO: API 연동
  return {
    feed: DUMMY_FEED,
    isLoading: false,
    refetch: () => {},
  };
}
