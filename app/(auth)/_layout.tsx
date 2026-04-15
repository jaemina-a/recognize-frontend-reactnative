import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { isLoggedIn, isHydrated } = useAuth();

  if (!isHydrated) return null;
  if (isLoggedIn) return <Redirect href="/(main)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
