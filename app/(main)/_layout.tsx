import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { Redirect, Stack } from 'expo-router';

export default function MainLayout() {
  const { isLoggedIn, isHydrated } = useAuth();

  if (!isHydrated) return null;
  if (!isLoggedIn) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="create-room"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack>
  );
}
