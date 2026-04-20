export type Recognition = {
  id: string;
  roomId: string;
  uploaderId: string;
  uploaderNickname: string;
  uploaderColor: string;
  photoUrl: string;
  uploadedAt: string;
};

export type CalendarUpload = {
  userId: string;
  nickname: string;
  color: string;
};

export type CalendarDay = {
  date: string;
  uploads: CalendarUpload[];
};
