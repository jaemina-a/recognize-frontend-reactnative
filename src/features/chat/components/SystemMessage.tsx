import { useTheme } from '@/design';
import { Text } from '@/src/components/ui';
import { View } from 'react-native';
import type { ChatMessage } from '../types/chat.types';

type Props = { message: ChatMessage; nicknameByUserId?: Record<string, string> };

function describe(message: ChatMessage, nicknameByUserId?: Record<string, string>): string {
  if (message.content === 'member_joined') {
    const uid = (message.metadata?.userId as string | undefined) ?? '';
    const nick = nicknameByUserId?.[uid];
    return nick ? `${nick}님이 입장했습니다` : '새 멤버가 입장했습니다';
  }
  return message.content;
}

export function SystemMessage({ message, nicknameByUserId }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16 }}>
      <Text variant="bodySmall" color={colors.onSurfaceVariant}>
        {describe(message, nicknameByUserId)}
      </Text>
    </View>
  );
}
