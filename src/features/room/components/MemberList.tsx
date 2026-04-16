import { Avatar, Badge, Text } from '@/src/components/ui';
import { View } from 'react-native';
import type { RoomMember } from '../types/room.types';

type MemberListProps = {
  members: RoomMember[];
};

export function MemberList({ members }: MemberListProps) {
  const sorted = [...members].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <View>
      <Text variant="h3" className="mb-3">멤버 랭킹</Text>
      {sorted.map((member, index) => (
        <View
          key={member.userId}
          className="flex-row items-center py-3 border-b border-gray-100"
        >
          <Text className="w-8 text-gray-500 font-semibold">{index + 1}</Text>
          <View
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: member.color }}
          />
          <Avatar name={member.nickname} size={36} className="mr-3" />
          <Text className="flex-1 font-medium">{member.nickname}</Text>
          <Badge label={`${member.totalScore}점`} />
        </View>
      ))}
    </View>
  );
}
