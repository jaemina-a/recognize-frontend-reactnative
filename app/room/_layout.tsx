import { Stack } from 'expo-router';

export default function RoomLayout() {
  return (
    <Stack>
      <Stack.Screen name="join" options={{ title: '방 참가' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
