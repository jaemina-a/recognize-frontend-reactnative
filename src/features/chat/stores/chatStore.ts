import { create } from 'zustand';
import type { AnyMessage, ChatMessage, PendingMessage } from '../types/chat.types';

const MAX_CACHE_PER_ROOM = 200;

type ChatState = {
  messagesByRoom: Record<string, AnyMessage[]>;
  unreadByRoom: Record<string, number>;
  cursorByRoom: Record<string, string | null>;
  // 액션
  setInitial: (roomId: string, messages: ChatMessage[], nextCursor: string | null) => void;
  prependPage: (roomId: string, messages: ChatMessage[], nextCursor: string | null) => void;
  appendIncoming: (roomId: string, message: ChatMessage) => void;
  appendPending: (roomId: string, pending: PendingMessage) => void;
  confirmPending: (roomId: string, clientId: string, message: ChatMessage) => void;
  failPending: (roomId: string, clientId: string) => void;
  setUnread: (roomId: string, count: number) => void;
  decrementUnread: (roomId: string, by?: number) => void;
  clearUnread: (roomId: string) => void;
};

function dedupeAndCap(messages: AnyMessage[]): AnyMessage[] {
  const seen = new Set<string>();
  const out: AnyMessage[] = [];
  // 최신이 앞쪽 (inverted FlatList 데이터). DESC.
  for (const m of messages) {
    const key = m.id || m.clientId || `${m.createdAt}:${m.content}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out.slice(0, MAX_CACHE_PER_ROOM);
}

export const useChatStore = create<ChatState>((set) => ({
  messagesByRoom: {},
  unreadByRoom: {},
  cursorByRoom: {},

  setInitial: (roomId, messages, nextCursor) =>
    set((s) => ({
      messagesByRoom: { ...s.messagesByRoom, [roomId]: dedupeAndCap(messages) },
      cursorByRoom: { ...s.cursorByRoom, [roomId]: nextCursor },
    })),

  prependPage: (roomId, messages, nextCursor) =>
    set((s) => {
      const prev = s.messagesByRoom[roomId] ?? [];
      // prev는 DESC. messages도 DESC. 과거 페이지를 뒤에 붙임.
      const merged = dedupeAndCap([...prev, ...messages]);
      return {
        messagesByRoom: { ...s.messagesByRoom, [roomId]: merged },
        cursorByRoom: { ...s.cursorByRoom, [roomId]: nextCursor },
      };
    }),

  appendIncoming: (roomId, message) =>
    set((s) => {
      const prev = s.messagesByRoom[roomId] ?? [];
      // clientId 매칭되는 pending이 있으면 confirmPending이 처리. 여기선 신규만.
      const exists = prev.some(
        (m) => m.id === message.id || (message.clientId && m.clientId === message.clientId),
      );
      if (exists) return s;
      return {
        messagesByRoom: { ...s.messagesByRoom, [roomId]: dedupeAndCap([message, ...prev]) },
      };
    }),

  appendPending: (roomId, pending) =>
    set((s) => {
      const prev = s.messagesByRoom[roomId] ?? [];
      return {
        messagesByRoom: { ...s.messagesByRoom, [roomId]: dedupeAndCap([pending, ...prev]) },
      };
    }),

  confirmPending: (roomId, clientId, message) =>
    set((s) => {
      const prev = s.messagesByRoom[roomId] ?? [];
      const replaced = prev.map((m) => (m.clientId === clientId ? message : m));
      return {
        messagesByRoom: { ...s.messagesByRoom, [roomId]: dedupeAndCap(replaced) },
      };
    }),

  failPending: (roomId, clientId) =>
    set((s) => {
      const prev = s.messagesByRoom[roomId] ?? [];
      const next = prev.map((m) =>
        m.clientId === clientId ? ({ ...m, status: 'failed' } as PendingMessage) : m,
      );
      return { messagesByRoom: { ...s.messagesByRoom, [roomId]: next } };
    }),

  setUnread: (roomId, count) =>
    set((s) => ({ unreadByRoom: { ...s.unreadByRoom, [roomId]: count } })),

  decrementUnread: (roomId, by = 1) =>
    set((s) => ({
      unreadByRoom: {
        ...s.unreadByRoom,
        [roomId]: Math.max(0, (s.unreadByRoom[roomId] ?? 0) - by),
      },
    })),

  clearUnread: (roomId) =>
    set((s) => ({ unreadByRoom: { ...s.unreadByRoom, [roomId]: 0 } })),
}));
