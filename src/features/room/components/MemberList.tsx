import { Avatar, Badge, Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import { View } from 'react-native';
import type { RoomMember } from '../types/room.types';

type MemberListProps = {
  members: RoomMember[];
};

export function MemberList({ members }: MemberListProps) {
  const { colors } = useTheme();
  const sorted = [...members].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <View>
      <Text variant="titleMedium" style={{ marginBottom: 12 }}>멤버 랭킹</Text>
      {sorted.map((member, index) => (
        <View
          key={member.userId}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.outlineVariant,
          }}
        >
          <Text variant="labelLarge" color={colors.onSurfaceVariant} style={{ width: 28 }}>
            {index + 1}
          </Text>
          <View
            style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: member.color, marginRight: 8 }}
          />
          <View style={{ marginRight: 12 }}>
            <Avatar name={member.nickname} size={36} />
          </View>
          <Text variant="bodyLarge" style={{ flex: 1 }}>{member.nickname}</Text>
          <Badge label={`${member.totalScore}점`} variant="secondary" />
        </View>
      ))}
    </View>
  );
}
