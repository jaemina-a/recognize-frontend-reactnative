import { shape, useTheme } from '@/design';
import { Avatar, Text } from '@/src/components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import type { AnyMessage } from '../types/chat.types';
import { isPending } from '../types/chat.types';
import { formatTime } from '../utils/messageGrouping';

type Props = {
  message: AnyMessage;
  isMine: boolean;
  isFirstOfGroup: boolean;
  isLastOfGroup: boolean;
  senderNickname?: string;
  senderColor?: string;
  onRetry?: () => void;
};

function MessageBubbleInner({
  message,
  isMine,
  isFirstOfGroup,
  isLastOfGroup,
  senderNickname,
  senderColor,
  onRetry,
}: Props) {
  const { colors } = useTheme();

  const bubbleBg = isMine ? colors.primary : colors.surfaceContainerHigh;
  const textColor = isMine ? colors.onPrimary : colors.onSurface;
  const failed = isPending(message) && message.status === 'failed';
  const sending = isPending(message) && message.status === 'sending';

  return (
    <View
      style={{
        flexDirection: isMine ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        marginTop: isFirstOfGroup ? 12 : 4,
      }}
    >
      {/* 좌측 아바타 영역: 상대 메시지 + 그룹 마지막 일 때만 표시 */}
      {!isMine ? (
        <View style={{ width: 32, marginRight: 8, alignSelf: 'flex-end' }}>
          {isLastOfGroup && senderNickname ? (
            <Avatar name={senderNickname} size={32} color={senderColor} />
          ) : null}
        </View>
      ) : null}

      <View style={{ maxWidth: '75%' }}>
        {/* 상대 메시지 그룹 첫 메시지에 닉네임 표시 */}
        {!isMine && isFirstOfGroup && senderNickname ? (
          <Text
            variant="labelSmall"
            color={colors.onSurfaceVariant}
            style={{ marginLeft: 4, marginBottom: 2 }}
          >
            {senderNickname}
          </Text>
        ) : null}

        <View
          style={{
            flexDirection: isMine ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
            gap: 6,
          }}
        >
          <Pressable
            onPress={failed && onRetry ? onRetry : undefined}
            style={{
              backgroundColor: bubbleBg,
              borderRadius: shape.large,
              paddingHorizontal: 12,
              paddingVertical: 8,
              opacity: sending ? 0.6 : 1,
            }}
          >
            <Text style={{ color: textColor, fontSize: 15, lineHeight: 20 }}>
              {message.content}
            </Text>
          </Pressable>

          {/* 보조 정보: 시간/상태 */}
          {isLastOfGroup && !failed && !sending ? (
            <Text variant="labelSmall" color={colors.onSurfaceVariant}>
              {formatTime(message.createdAt)}
            </Text>
          ) : null}
          {sending ? (
            <MaterialCommunityIcons
              name="clock-outline"
              size={12}
              color={colors.onSurfaceVariant}
            />
          ) : null}
          {failed ? (
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={14}
              color={colors.error}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

export const MessageBubble = memo(MessageBubbleInner);
