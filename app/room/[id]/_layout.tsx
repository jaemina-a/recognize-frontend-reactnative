import { Stack } from 'expo-router';

export default function RoomDetailLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="upload" options={{ title: '갓생 인증', presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ title: '방 설정' }} />
    </Stack>
  );
}
