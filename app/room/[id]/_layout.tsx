import { Stack } from 'expo-router';

export default function RoomDetailLayout() {
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
        name="upload"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="settings" />
      <Stack.Screen name="calendar" />
    </Stack>
  );
}
