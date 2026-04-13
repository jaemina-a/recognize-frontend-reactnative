import '@/global.css';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  // TODO: useAuth()로 로그인 상태 분기
  // 와이어프레임 단계에서는 항상 (main) 표시

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="room" />
      </Stack>
    </SafeAreaProvider>
  );
}
