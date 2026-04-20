import '@/global.css';
import { ThemeProvider } from '@/design';
import { disconnectChatSocket } from '@/src/features/chat/hooks/useChatSocket';
import { useChatStore } from '@/src/features/chat/stores/chatStore';
import { StoryViewer } from '@/src/features/recognition/components/StoryViewer';
import { useAuthStore } from '@/src/stores/authStore';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 토큰 변경(로그아웃/계정 전환) 시 채팅 소켓·캐시 초기화 안전망
let prevAuthToken: string | null = useAuthStore.getState().token;
useAuthStore.subscribe((state) => {
  const next = state.token;
  if (prevAuthToken && prevAuthToken !== next) {
    disconnectChatSocket();
    useChatStore.setState({
      messagesByRoom: {},
      unreadByRoom: {},
      cursorByRoom: {},
    });
  }
  prevAuthToken = next;
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              animationDuration: 250,
            }}
          >
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(main)" />
            <Stack.Screen name="room" />
          </Stack>
          <StoryViewer />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
