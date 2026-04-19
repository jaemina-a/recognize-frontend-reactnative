import { useCallback, useEffect, useState } from 'react';
import { chatApi } from '../api/chatApi';
import { useChatStore } from '../stores/chatStore';
import type { AnyMessage, ChatRoom } from '../types/chat.types';

const EMPTY_MESSAGES: AnyMessage[] = [];

/**
 * 채팅방 메타 + 초기 메시지 로드 + 페이지네이션
 */
export function useChatMessages(roomId: string) {
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messages = useChatStore((s) => s.messagesByRoom[roomId] ?? EMPTY_MESSAGES);
  const cursor = useChatStore((s) => s.cursorByRoom[roomId] ?? null);
  const setInitial = useChatStore((s) => s.setInitial);
  const prependPage = useChatStore((s) => s.prependPage);
  const setUnread = useChatStore((s) => s.setUnread);

  const init = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const room = await chatApi.getChatRoom(roomId);
      setChatRoom(room);
      setUnread(roomId, room.unreadCount);
      const page = await chatApi.getMessages(roomId);
      setInitial(roomId, page.messages, page.nextCursor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [roomId, setInitial, setUnread]);

  useEffect(() => {
    init();
  }, [init]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !cursor) return;
    try {
      setLoadingMore(true);
      const page = await chatApi.getMessages(roomId, cursor);
      prependPage(roomId, page.messages, page.nextCursor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, prependPage, roomId]);

  return {
    chatRoom,
    messages,
    loading,
    loadingMore,
    error,
    hasMore: cursor !== null,
    loadMore,
    refresh: init,
  };
}
