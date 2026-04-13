// TODO: 소셜 로그인 API 구현
// 카카오/구글 OAuth 토큰 → 서버 토큰 교환

export const authApi = {
  loginWithKakao: async (oauthToken: string) => {
    // TODO: POST /auth/kakao
  },
  loginWithGoogle: async (oauthToken: string) => {
    // TODO: POST /auth/google
  },
  logout: async () => {
    // TODO: POST /auth/logout
  },
};
