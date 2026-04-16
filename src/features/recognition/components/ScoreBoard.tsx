import { Avatar, Badge, Text } from '@/src/components/ui';
import type { RoomMember } from '@/src/features/room/types/room.types';
import { View } from 'react-native';

type ScoreBoardProps = {
  members: RoomMember[];
};

export function ScoreBoard({ members }: ScoreBoardProps) {
  const sorted = [...members].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <View className="px-5 py-4 border-t border-gray-200">
      <Text variant="h3" className="mb-3">오늘의 랭킹</Text>
      {sorted.map((member, index) => (
        <View
          key={member.userId}
          className="flex-row items-center py-2"
        >
          <Text className="w-6 font-bold text-gray-400">{index + 1}</Text>
          <View
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: member.color }}
          />
          <Avatar name={member.nickname} size={32} className="mr-2" />
          <Text className="flex-1">{member.nickname}</Text>
          <Badge label={`${member.totalScore}점`} />
        </View>
      ))}
    </View>
  );
}
