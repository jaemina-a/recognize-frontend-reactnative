export type User = {
  id: string;
  nickname: string;
  profileImage: string | null;
  provider: 'kakao' | 'mock';
};

export type AuthToken = {
  accessToken: string;
  refreshToken: string;
};
