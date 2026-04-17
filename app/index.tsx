import { Loading } from '@/src/components/feedback';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isLoggedIn, isHydrated } = useAuth();

  if (!isHydrated) {
    return <Loading fullScreen />;
  }

  return <Redirect href={isLoggedIn ? ('/(main)' as any) : ('/(auth)/login' as any)} />;
}
