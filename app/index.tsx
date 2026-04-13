import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: 로그인 상태에 따라 분기
  // const { isLoggedIn } = useAuth();
  // return <Redirect href={isLoggedIn ? '/(main)' : '/(auth)/login'} />;

  // 와이어프레임: 메인으로 이동
  return <Redirect href={'/(main)' as any} />;
}
