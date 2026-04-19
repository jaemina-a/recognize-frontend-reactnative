export type ChatMessageType = 'text' | 'system' | 'image';

export type ChatMessage = {
  id: string;
  chatRoomId: string;
  senderId: string | null;
  type: ChatMessageType;
  content: string;
  metadata: Record<string, unknown>;
  clientId: string | null;
  createdAt: string;
};

export type ChatRoom = {
  id: string;
  roomId: string | null;
  type: 'group' | 'dm';
  lastMessageId: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type PendingStatus = 'sending' | 'failed';

export type PendingMessage = ChatMessage & {
  status: PendingStatus;
};

export type AnyMessage = ChatMessage | PendingMessage;

export function isPending(m: AnyMessage): m is PendingMessage {
  return (m as PendingMessage).status !== undefined;
}

export type MessagesPage = {
  messages: ChatMessage[];
  nextCursor: string | null;
};
