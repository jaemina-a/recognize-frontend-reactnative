import { Avatar, Badge, Text } from '@/src/components/ui';
import type { RoomMember } from '@/src/features/room/types/room.types';
import { View } from 'react-native';

type ScoreBoardProps = {
  members: RoomMember[];
};

// NOTE: This component is no longer rendered on the room page (removed per UX spec).
// Kept for backward-compat in case any other screen references it.
export function ScoreBoard({ members }: ScoreBoardProps) {
  const sorted = [...members].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#CAC4D0' }}>
      <Text variant="titleMedium" style={{ marginBottom: 12 }}>오늘의 랭킹</Text>
      {sorted.map((member, index) => (
        <View key={member.userId} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
          <Text variant="labelLarge" style={{ width: 24 }}>{index + 1}</Text>
          <View style={{ width: 10, height: 10, borderRadius: 5, marginRight: 8, backgroundColor: member.color }} />
          <View style={{ marginRight: 8 }}>
            <Avatar name={member.nickname} size={32} />
          </View>
          <Text style={{ flex: 1 }}>{member.nickname}</Text>
          <Badge label={`${member.totalScore}점`} variant="secondary" />
        </View>
      ))}
    </View>
  );
}
