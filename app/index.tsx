import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isLoggedIn, isHydrated } = useAuth();

  // AsyncStorage에서 상태 복원 중
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={isLoggedIn ? ('/(main)' as any) : ('/(auth)/login' as any)} />;
}
