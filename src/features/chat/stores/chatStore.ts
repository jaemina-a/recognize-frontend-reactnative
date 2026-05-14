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

      // 1) 같은 id가 이미 있으면 무시 (재전송/재join 중복 방지)
      if (message.id && prev.some((m) => m.id === message.id)) return s;

      // 2) 같은 clientId의 pending이 있으면 그 자리에서 교체 (송신자 본인 broadcast 흐름)
      if (message.clientId) {
        const idx = prev.findIndex((m) => m.clientId === message.clientId);
        if (idx >= 0) {
          const replaced = [...prev];
          replaced[idx] = message;
          return { messagesByRoom: { ...s.messagesByRoom, [roomId]: replaced } };
        }
      }

      // 3) 그 외에는 신규 메시지로 prepend (수신자 흐름)
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
