import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRecognitionFeed } from '../hooks/useRecognitionFeed';
import { useVote } from '../hooks/useVote';
import { EmptyFeed } from './EmptyFeed';
import { RecognitionCard } from './RecognitionCard';
import { VoteOverlay } from './VoteOverlay';

type RecognitionFeedProps = {
  roomId: string;
};

export function RecognitionFeed({ roomId }: RecognitionFeedProps) {
  const { feed } = useRecognitionFeed(roomId);
  const { vote } = useVote();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleVote = (value: 'recognize' | 'reject') => {
    if (selectedId) {
      vote(selectedId, value);
      setSelectedId(null);
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
          <View className="relative">
            <RecognitionCard
              recognition={item}
              onPress={() => setSelectedId(item.id)}
            />
            <VoteOverlay
              visible={selectedId === item.id}
              onVote={handleVote}
              onClose={() => setSelectedId(null)}
            />
          </View>
        )}
      />
    </View>
  );
}
