export type Recognition = {
  id: string;
  roomId: string;
  uploaderId: string;
  uploaderNickname: string;
  uploaderColor: string;
  photoUrl: string;
  uploadedAt: string;
  isRecognized: boolean;
  recognizedBy: {
    userId: string;
    nickname: string;
    recognizedAt: string;
  } | null;
};

export type CalendarDay = {
  date: string;
  recognitions: {
    userId: string;
    nickname: string;
    color: string;
  }[];
};
