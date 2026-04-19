import { useTheme } from '@/design';
import { ScreenContainer } from '@/src/components/layout';
import { Text } from '@/src/components/ui';
import type { RoomMember } from '@/src/features/room/types/room.types';
import { useEffect } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { chatApi } from '../api/chatApi';
import { useChatMessages } from '../hooks/useChatMessages';
import { useChatSocket } from '../hooks/useChatSocket';
import { useSendMessage } from '../hooks/useSendMessage';
import { useChatStore } from '../stores/chatStore';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

type Props = {
  roomId: string;
  roomName: string;
  members: RoomMember[];
  onBack?: () => void;
};

export function ChatScreen({ roomId, roomName, members, onBack }: Props) {
  const { colors } = useTheme();
  const { chatRoom, messages, loading, loadingMore, hasMore, error, loadMore } =
    useChatMessages(roomId);

  const socketRef = useChatSocket({
    roomId,
    chatRoomId: chatRoom?.id ?? null,
    enabled: chatRoom != null,
  });

  const { send, retry } = useSendMessage({
    roomId,
    chatRoomId: chatRoom?.id ?? null,
    socketRef,
  });

  const clearUnread = useChatStore((s) => s.clearUnread);

  // 채팅방 진입 시 읽음 처리
  useEffect(() => {
    if (!chatRoom) return;
    clearUnread(roomId);
    chatApi.markRead(roomId).catch(() => {
      /* 무시: 다음 진입 때 다시 시도 */
    });
  }, [chatRoom, clearUnread, roomId]);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ChatHeader title={roomName} subtitle={`멤버 ${members.length}명`} onBack={onBack} />

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text variant="bodyMedium" color={colors.error}>
              메시지를 불러오지 못했습니다
            </Text>
          </View>
        ) : (
          <MessageList
            messages={messages}
            members={members}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onRetry={retry}
          />
        )}

        <MessageInput onSend={send} disabled={!chatRoom} />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
