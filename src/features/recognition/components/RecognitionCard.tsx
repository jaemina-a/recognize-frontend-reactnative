import { Badge, Text } from '@/src/components/ui';
import { CONFIG } from '@/src/constants/config';
import { formatTime } from '@/src/utils/format';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';
import type { Recognition } from '../types/recognition.types';

type RecognitionCardProps = {
  recognition: Recognition;
  onRecognize: () => void;
  isOwnPhoto: boolean;
};

export function RecognitionCard({ recognition, onRecognize, isOwnPhoto }: RecognitionCardProps) {
  return (
    <View className="mb-4">
      <View className="bg-gray-200 rounded-2xl h-48 justify-center items-center overflow-hidden">
        {recognition.photoUrl ? (
          <Image
            source={{ uri: `${CONFIG.API_URL}/${recognition.photoUrl}` }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <View className="absolute inset-0 bg-gray-300" />
        )}

        <View className="absolute bg-black/60 rounded-full px-4 py-2">
          <Text className="text-white font-semibold text-lg">
            {formatTime(recognition.uploadedAt)}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-2 px-1">
        <View className="flex-row items-center">
          <View
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: recognition.uploaderColor }}
          />
          <Text className="font-medium">{recognition.uploaderNickname}</Text>
        </View>

        {recognition.isRecognized ? (
          <Badge label={`✓ ${recognition.recognizedBy?.nickname}이 인정`} />
        ) : !isOwnPhoto ? (
          <Pressable
            onPress={onRecognize}
            className="bg-black rounded-full px-4 py-1.5"
          >
            <Text className="text-white text-sm font-semibold">인정하기</Text>
          </Pressable>
        ) : (
          <Text variant="caption">인정 대기중</Text>
        )}
      </View>
    </View>
  );
}
