// 인터셉터 로직은 src/api/client.ts에 통합되어 있습니다.
// - 요청: authStore에서 토큰 가져와 Authorization 헤더 주입
// - 응답: 401 시 토큰 갱신 또는 로그아웃 처리
export {};
