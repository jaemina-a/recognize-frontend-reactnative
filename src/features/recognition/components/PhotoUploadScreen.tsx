import { ScreenContainer } from '@/src/components/layout';
import { Button, Text } from '@/src/components/ui';
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
      <View className="flex-1 px-5 pt-8">
        <Text variant="h2" className="mb-6">갓생 인증하기</Text>

        <View className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl h-72 items-center justify-center mb-6 overflow-hidden">
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <>
              <Text className="text-4xl mb-2">📸</Text>
              <Text variant="caption">사진을 선택하세요</Text>
            </>
          )}
        </View>

        <View className="flex-row gap-3 mb-6">
          <Button
            title="카메라"
            variant="outlined"
            className="flex-1"
            onPress={() => pickImage(true)}
          />
          <Button
            title="갤러리"
            variant="outlined"
            className="flex-1"
            onPress={() => pickImage(false)}
          />
        </View>

        <Button
          title={isUploading ? '업로드 중...' : '업로드'}
          onPress={handleUpload}
          disabled={!photoUri || isUploading}
        />
      </View>
    </ScreenContainer>
  );
}
