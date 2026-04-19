import { useTheme } from '@/design';
import { Text } from '@/src/components/ui';
import { useAuthStore } from '@/src/stores/authStore';
import type { RoomMember } from '@/src/features/room/types/room.types';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import type { AnyMessage } from '../types/chat.types';
import { isPending } from '../types/chat.types';
import { buildRenderItems, type RenderItem } from '../utils/messageGrouping';
import { DateDivider } from './DateDivider';
import { MessageBubble } from './MessageBubble';
import { SystemMessage } from './SystemMessage';

type Props = {
  messages: AnyMessage[];
  members: RoomMember[];
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry?: (clientId: string, content: string) => void;
};

export function MessageList({
  messages,
  members,
  loadingMore,
  hasMore,
  onLoadMore,
  onRetry,
}: Props) {
  const { colors } = useTheme();
  const myUserId = useAuthStore((s) => s.user?.id ?? null);

  const memberMap = useMemo(() => {
    const m = new Map<string, RoomMember>();
    for (const mem of members) m.set(mem.userId, mem);
    return m;
  }, [members]);

  const nicknameByUserId = useMemo(() => {
    const obj: Record<string, string> = {};
    for (const mem of members) obj[mem.userId] = mem.nickname;
    return obj;
  }, [members]);

  const items = useMemo(() => buildRenderItems(messages), [messages]);

  if (messages.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text variant="bodyMedium" color={colors.onSurfaceVariant}>
          첫 메시지를 보내보세요
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: RenderItem }) => {
    if (item.kind === 'date') {
      return <DateDivider date={item.date} />;
    }
    const m = item.message;
    if (m.type === 'system') {
      return (
        <SystemMessage
          message={m}
          nicknameByUserId={nicknameByUserId}
        />
      );
    }
    const isMine = m.senderId === myUserId;
    const sender = m.senderId ? memberMap.get(m.senderId) : undefined;
    return (
      <MessageBubble
        message={m}
        isMine={isMine}
        isFirstOfGroup={item.isFirstOfGroup}
        isLastOfGroup={item.isLastOfGroup}
        senderNickname={sender?.nickname}
        senderColor={sender?.color}
        onRetry={
          onRetry && isPending(m) && m.status === 'failed' && m.clientId
            ? () => onRetry(m.clientId!, m.content)
            : undefined
        }
      />
    );
  };

  return (
    <FlatList
      style={{ flex: 1 }}
      data={items}
      inverted
      keyExtractor={(it) =>
        it.kind === 'date' ? it.key : it.message.id || it.message.clientId || `${it.message.createdAt}`
      }
      renderItem={renderItem}
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMore ? (
          <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null
      }
      windowSize={10}
      maxToRenderPerBatch={20}
      removeClippedSubviews
      contentContainerStyle={{ paddingVertical: 12 }}
    />
  );
}
