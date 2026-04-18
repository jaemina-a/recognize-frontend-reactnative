import { Badge, Text } from '@/src/components/ui';
import { shape, useTheme } from '@/design';
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
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          backgroundColor: colors.surfaceContainerHigh,
          borderRadius: shape.large,
          height: 192,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {recognition.photoUrl ? (
          <Image
            source={{ uri: `${CONFIG.API_URL}/${recognition.photoUrl}` }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: colors.surfaceContainerHighest,
            }}
          />
        )}

        <View
          style={{
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: shape.full,
            paddingHorizontal: 16,
            paddingVertical: 6,
          }}
        >
          <Text variant="titleMedium" color="#FFFFFF">
            {formatTime(recognition.uploadedAt)}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingHorizontal: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginRight: 8,
              backgroundColor: recognition.uploaderColor,
            }}
          />
          <Text variant="labelLarge">{recognition.uploaderNickname}</Text>
        </View>

        {recognition.isRecognized ? (
          <Badge label={`✓ ${recognition.recognizedBy?.nickname} 인정`} variant="tertiary" />
        ) : !isOwnPhoto ? (
          <Pressable
            onPress={onRecognize}
            cssInterop={false}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              borderRadius: shape.full,
              paddingHorizontal: 16,
              paddingVertical: 8,
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Text variant="labelLarge" color={colors.onPrimary}>인정하기</Text>
          </Pressable>
        ) : (
          <Text variant="bodySmall" color={colors.onSurfaceVariant}>인정 대기중</Text>
        )}
      </View>
    </View>
  );
}
