import '@/global.css';
import { ThemeProvider } from '@/design';
import { RootErrorBoundary } from '@/src/components/RootErrorBoundary';
import { disconnectChatSocket } from '@/src/features/chat/hooks/useChatSocket';
import { useChatStore } from '@/src/features/chat/stores/chatStore';
import { StoryViewer } from '@/src/features/recognition/components/StoryViewer';
import { useAuthStore } from '@/src/stores/authStore';
import * as Updates from 'expo-updates';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
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
  useEffect(() => {
    if (!Updates.isEmbeddedLaunch) {
      return; // 이미 OTA로 실행 중이면 재체크 불필요
    }
    void (async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // 즉시 재시작하여 새 버전 적용
        }
      } catch {
        // 업데이트 실패 시 현재 버전으로 계속 실행
      }
    })();
  }, []);

  return (
    <RootErrorBoundary>
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
    </RootErrorBoundary>
  );
}
