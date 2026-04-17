import type { RoomMember } from '@/src/features/room/types/room.types';
import { useAuthStore } from '@/src/stores/authStore';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { useRecognitionFeed } from '../hooks/useRecognitionFeed';
import { useRecognize } from '../hooks/useVote';
import { EmptyFeed } from './EmptyFeed';
import { EmptyMemberCard } from './EmptyMemberCard';
import { RecognitionCard } from './RecognitionCard';

type RecognitionFeedProps = {
  roomId: string;
  members?: RoomMember[];
  onRecognized?: () => void;
};

type FeedRow =
  | { kind: 'recognition'; id: string; data: ReturnType<typeof useRecognitionFeed>['feed'][number] }
  | { kind: 'empty'; id: string; member: RoomMember };

export function RecognitionFeed({ roomId, members = [], onRecognized }: RecognitionFeedProps) {
  const { feed, refetch } = useRecognitionFeed(roomId);
  const { recognize } = useRecognize();
  const currentUserId = useAuthStore((s) => s.user?.id);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleRecognize = async (photoId: string) => {
    try {
      await recognize(photoId);
      refetch();
      onRecognized?.();
    } catch {
      /* handled in hook */
    }
  };

  // Rows: actual uploads first, then empty cards for members who haven't uploaded.
  const rows = useMemo<FeedRow[]>(() => {
    const uploadedIds = new Set(feed.map((f) => f.uploaderId));
    const recognitionRows: FeedRow[] = feed.map((r) => ({
      kind: 'recognition',
      id: `rec-${r.id}`,
      data: r,
    }));
    const emptyRows: FeedRow[] = members
      .filter((m) => !uploadedIds.has(m.userId))
      .map((m) => ({ kind: 'empty', id: `empty-${m.userId}`, member: m }));
    return [...recognitionRows, ...emptyRows];
  }, [feed, members]);

  if (rows.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
        renderItem={({ item }) => {
          if (item.kind === 'empty') {
            return <EmptyMemberCard nickname={item.member.nickname} color={item.member.color} />;
          }
          return (
            <RecognitionCard
              recognition={item.data}
              isOwnPhoto={item.data.uploaderId === currentUserId}
              onRecognize={() => handleRecognize(item.data.id)}
            />
          );
        }}
      />
    </View>
  );
}
