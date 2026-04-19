import { useCallback } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useChatStore } from '../stores/chatStore';
import type { ChatMessage, PendingMessage } from '../types/chat.types';
import { emitWithAck } from './useChatSocket';
import type { Socket } from 'socket.io-client';

function uuid(): string {
  // RN-friendly uuid v4 (간단 구현)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type Args = {
  roomId: string;
  chatRoomId: string | null;
  socketRef: React.MutableRefObject<Socket | null>;
};

export function useSendMessage({ roomId, chatRoomId, socketRef }: Args) {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const appendPending = useChatStore((s) => s.appendPending);
  const confirmPending = useChatStore((s) => s.confirmPending);
  const failPending = useChatStore((s) => s.failPending);

  const send = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || !chatRoomId || !userId) return;

      const clientId = uuid();
      const now = new Date().toISOString();
      const pending: PendingMessage = {
        id: clientId,
        chatRoomId,
        senderId: userId,
        type: 'text',
        content: text,
        metadata: {},
        clientId,
        createdAt: now,
        status: 'sending',
      };
      appendPending(roomId, pending);

      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        failPending(roomId, clientId);
        return;
      }

      const ack = await emitWithAck<{ message: ChatMessage }>(
        socket,
        'chat:send',
        { chatRoomId, content: text, clientId },
      );
      if (ack.ok && ack.message) {
        confirmPending(roomId, clientId, ack.message);
      } else {
        failPending(roomId, clientId);
      }
    },
    [chatRoomId, userId, appendPending, confirmPending, failPending, roomId, socketRef],
  );

  const retry = useCallback(
    async (clientId: string, content: string) => {
      if (!chatRoomId) return;
      const socket = socketRef.current;
      if (!socket || !socket.connected) return;
      const ack = await emitWithAck<{ message: ChatMessage }>(
        socket,
        'chat:send',
        { chatRoomId, content, clientId },
      );
      if (ack.ok && ack.message) {
        confirmPending(roomId, clientId, ack.message);
      } else {
        failPending(roomId, clientId);
      }
    },
    [chatRoomId, confirmPending, failPending, roomId, socketRef],
  );

  return { send, retry };
}
