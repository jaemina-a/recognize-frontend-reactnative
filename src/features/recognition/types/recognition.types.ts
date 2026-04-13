export type Recognition = {
  id: string;
  roomId: string;
  userId: string;
  nickname: string;
  photoUrl: string;
  uploadedAt: string;
  votes: Vote[];
  recognizedCount: number;
};

export type Vote = {
  voterId: string;
  value: 'recognize' | 'reject';
};
