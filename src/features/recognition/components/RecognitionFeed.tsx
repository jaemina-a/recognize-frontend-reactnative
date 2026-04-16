import { useAuthStore } from '@/src/stores/authStore';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { useRecognitionFeed } from '../hooks/useRecognitionFeed';
import { useRecognize } from '../hooks/useVote';
import { EmptyFeed } from './EmptyFeed';
import { RecognitionCard } from './RecognitionCard';

type RecognitionFeedProps = {
  roomId: string;
  onRecognized?: () => void;
};

export function RecognitionFeed({ roomId, onRecognized }: RecognitionFeedProps) {
  const { feed, refetch } = useRecognitionFeed(roomId);
  const { recognize } = useRecognize();
  const currentUserId = useAuthStore((s) => s.user?.id);

  // 화면 포커스 시 피드 새로고침 (업로드 후 돌아올 때 반영)
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
      // Error handled in hook
    }
  };

  if (feed.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <View className="flex-1">
      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-5 pt-4"
        renderItem={({ item }) => (
          <RecognitionCard
            recognition={item}
            isOwnPhoto={item.uploaderId === currentUserId}
            onRecognize={() => handleRecognize(item.id)}
          />
        )}
      />
    </View>
  );
}
