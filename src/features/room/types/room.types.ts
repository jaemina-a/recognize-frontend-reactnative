export type Room = {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  members: RoomMember[];
  createdAt: string;
};

export type RoomMember = {
  userId: string;
  nickname: string;
  profileImage: string | null;
  totalScore: number;
};
