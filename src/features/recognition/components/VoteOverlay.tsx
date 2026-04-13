import { Text } from '@/src/components/ui';
import { Pressable } from 'react-native';

type VoteOverlayProps = {
  visible: boolean;
  onVote: (value: 'recognize' | 'reject') => void;
  onClose: () => void;
};

export function VoteOverlay({ visible, onVote, onClose }: VoteOverlayProps) {
  if (!visible) return null;

  return (
    <Pressable
      onPress={onClose}
      className="absolute inset-0 bg-black/40 flex-row justify-center items-center gap-12 z-20"
    >
      {/* 거절 */}
      <Pressable
        onPress={() => onVote('reject')}
        className="w-16 h-16 rounded-full bg-white border-2 border-gray-400 items-center justify-center"
      >
        <Text className="text-3xl text-gray-400">✕</Text>
      </Pressable>

      {/* 인정 */}
      <Pressable
        onPress={() => onVote('recognize')}
        className="w-16 h-16 rounded-full bg-black items-center justify-center"
      >
        <Text className="text-3xl text-white">✓</Text>
      </Pressable>
    </Pressable>
  );
}
