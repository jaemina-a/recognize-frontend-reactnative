export type User = {
  id: string;
  nickname: string;
  profileImage: string | null;
  provider: 'kakao' | 'google' | 'mock';
};

export type AuthToken = {
  accessToken: string;
  refreshToken: string;
};
