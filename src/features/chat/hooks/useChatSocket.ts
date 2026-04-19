import { CONFIG } from '@/src/constants/config';
import { useAuthStore } from '@/src/stores/authStore';
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useChatStore } from '../stores/chatStore';
import type { ChatMessage } from '../types/chat.types';

type AckOk<T> = { ok: true } & T;
type AckErr = { ok: false; error?: string };
export type Ack<T> = AckOk<T> | AckErr;

let sharedSocket: Socket | null = null;
let currentToken: string | null = null;

function getOrCreateSocket(token: string): Socket {
  if (sharedSocket && currentToken === token) {
    if (!sharedSocket.connected) sharedSocket.connect();
    return sharedSocket;
  }
  // 토큰이 다르거나 없음 → 기존 연결 폐기 후 새로 생성
  if (sharedSocket) {
    sharedSocket.removeAllListeners();
    sharedSocket.disconnect();
    sharedSocket = null;
  }
  currentToken = token;
  sharedSocket = io(`${CONFIG.API_URL}/chat`, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
  });
  return sharedSocket;
}

export function disconnectChatSocket() {
  if (sharedSocket) {
    sharedSocket.removeAllListeners();
    sharedSocket.disconnect();
    sharedSocket = null;
  }
  currentToken = null;
}

type UseChatSocketArgs = {
  roomId: string;
  chatRoomId: string | null;
  enabled: boolean;
};

/**
 * 채팅 소켓 연결 + 해당 chatRoom 구독.
 * - chatRoomId가 결정되면 join, 언마운트/변경 시 leave.
 * - 새 메시지 수신 시 chatStore에 반영.
 */
export function useChatSocket({ roomId, chatRoomId, enabled }: UseChatSocketArgs) {
  const token = useAuthStore((s) => s.token);
  const appendIncoming = useChatStore((s) => s.appendIncoming);
  const confirmPending = useChatStore((s) => s.confirmPending);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled || !token || !chatRoomId) return;
    const socket = getOrCreateSocket(token);
    socketRef.current = socket;

    const onConnect = () => {
      socket.emit('chat:join', { chatRoomId });
    };
    const onMessage = (msg: ChatMessage) => {
      if (msg.clientId) {
        confirmPending(roomId, msg.clientId, msg);
      } else {
        appendIncoming(roomId, msg);
      }
    };

    socket.on('connect', onConnect);
    socket.on('chat:message', onMessage);
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('chat:message', onMessage);
      socket.emit('chat:leave', { chatRoomId });
    };
  }, [enabled, token, chatRoomId, roomId, appendIncoming, confirmPending]);

  return socketRef;
}

/** ack를 promise로 감싸는 helper */
export function emitWithAck<T = unknown>(
  socket: Socket,
  event: string,
  payload: unknown,
  timeoutMs = 5000,
): Promise<Ack<T>> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ ok: false, error: 'timeout' }), timeoutMs);
    socket.emit(event, payload, (ack: Ack<T>) => {
      clearTimeout(timer);
      resolve(ack ?? { ok: false, error: 'no-ack' });
    });
  });
}
