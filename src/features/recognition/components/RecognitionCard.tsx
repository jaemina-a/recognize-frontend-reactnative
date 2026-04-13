import { Text } from '@/src/components/ui';
import { formatTime } from '@/src/utils/format';
import { Pressable, View } from 'react-native';
import type { Recognition } from '../types/recognition.types';

type RecognitionCardProps = {
  recognition: Recognition;
  onPress: () => void;
};

export function RecognitionCard({ recognition, onPress }: RecognitionCardProps) {
  return (
    <Pressable onPress={onPress} className="mb-4">
      <View className="bg-gray-200 rounded-2xl h-48 justify-center items-center overflow-hidden">
        {/* TODO: 실제 사진으로 교체 — recognition.photoUrl */}
        <View className="absolute inset-0 bg-gray-300" />

        {/* 중앙 시간 표시 */}
        <View className="bg-black/60 rounded-full px-4 py-2 z-10">
          <Text className="text-white font-semibold text-lg">
            {formatTime(recognition.uploadedAt)}
          </Text>
        </View>
      </View>

      {/* 하단 정보 */}
      <View className="flex-row justify-between items-center mt-2 px-1">
        <Text className="font-medium">{recognition.nickname}</Text>
        <Text variant="caption">인정 {recognition.recognizedCount}개</Text>
      </View>
    </Pressable>
  );
}
