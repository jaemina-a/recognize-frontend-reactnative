import { ScreenContainer } from '@/src/components/layout';
import { Button, IconButton, Text } from '@/src/components/ui';
import { shape, useTheme } from '@/design';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import { useRecognitionFeed } from '../hooks/useRecognitionFeed';
import { useAuthStore } from '@/src/stores/authStore';

export function PhotoUploadScreen() {
  const { id: roomId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { upload, isUploading } = usePhotoUpload();
  const { feed } = useRecognitionFeed(roomId!);
  const userId = useAuthStore((s) => s.user?.id);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const existingPhoto = feed.find((f) => f.uploaderId === userId);

  const pickImage = async (useCamera: boolean) => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.8,
    };
    const result = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const doUpload = async () => {
    if (!photoUri || !roomId) return;
    try {
      await upload(roomId, photoUri);
      router.back();
    } catch {
      Alert.alert('오류', '업로드에 실패했습니다.');
    }
  };

  const handleUpload = () => {
    if (existingPhoto) {
      Alert.alert(
        '재업로드',
        '이미 업로드한 사진이 있습니다. 새 사진으로 교체하시겠습니까?\n(기존 인정 기록은 초기화됩니다)',
        [
          { text: '취소', style: 'cancel' },
          { text: '교체', style: 'destructive', onPress: doUpload },
        ],
      );
    } else {
      doUpload();
    }
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ height: 56, flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon="arrow-left" variant="standard" onPress={() => router.back()} />
          <Text variant="titleLarge" style={{ marginLeft: 12 }}>인증하기</Text>
        </View>

        <View
          style={{
            marginTop: 16,
            backgroundColor: colors.surfaceContainerHigh,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: colors.outlineVariant,
            borderRadius: shape.large,
            height: 288,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: 24,
          }}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <Text variant="bodyMedium" color={colors.onSurfaceVariant}>사진을 선택하세요</Text>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Button title="카메라" variant="outlined" onPress={() => pickImage(true)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="갤러리" variant="outlined" onPress={() => pickImage(false)} />
          </View>
        </View>

        <Button
          title={isUploading ? '업로드 중...' : '업로드'}
          onPress={handleUpload}
          disabled={!photoUri || isUploading}
          size="lg"
        />
      </View>
    </ScreenContainer>
  );
}
