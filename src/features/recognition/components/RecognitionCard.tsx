import { Text } from '@/src/components/ui';
import { shape, useTheme } from '@/design';
import { CONFIG } from '@/src/constants/config';
import { formatTime } from '@/src/utils/format';
import { Image } from 'expo-image';
import { View } from 'react-native';
import type { Recognition } from '../types/recognition.types';

type RecognitionCardProps = {
  recognition: Recognition;
  isOwnPhoto: boolean;
};

export function RecognitionCard({ recognition }: RecognitionCardProps) {
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

        {/* Uploader badge: top-left inside the photo */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.45)',
            borderRadius: shape.full,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginRight: 6,
              backgroundColor: recognition.uploaderColor,
            }}
          />
          <Text variant="labelMedium" color="#FFFFFF">
            {recognition.uploaderNickname}
          </Text>
        </View>

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
    </View>
  );
}
