import { ScreenContainer } from '@/src/components/layout';
import { Button, IconButton, Text } from '@/src/components/ui';
import { shape, useTheme } from '@/design';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, View } from 'react-native';
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
  // 카메라로 촬영한 직후 풀스크린 미리보기에서 사용하는 URI
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCameraUploading, setIsCameraUploading] = useState(false);

  const existingPhoto = feed.find((f) => f.uploaderId === userId);

  // 갤러리 선택 (기존 동작 유지)
  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // 카메라 촬영 → 풀스크린 미리보기로 전환
  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        '카메라 권한 필요',
        '카메라 권한이 없습니다. 설정에서 권한을 허용해 주세요.',
        [{ text: '확인' }],
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
      // saveToPhotos 미지정(기본 false) → 갤러리 저장 안 함 (인스타 스토리 방식)
    });

    if (result.canceled || !result.assets[0]) return;
    setCapturedUri(result.assets[0].uri);
  };

  // 다시 촬영
  const handleRetake = () => {
    setCapturedUri(null);
    void handleCameraCapture();
  };

  // 카메라 미리보기에서 게시
  const doUploadFromCamera = async (uri: string) => {
    if (!roomId) return;
    setIsCameraUploading(true);
    try {
      await upload(roomId, uri);
      setCapturedUri(null);
      router.back();
    } catch {
      Alert.alert('업로드 실패', '사진 업로드에 실패했습니다. 다시 시도해 주세요.');
      // 실패 시 미리보기 유지 → [게시] 재시도 가능
    } finally {
      setIsCameraUploading(false);
    }
  };

  const handlePost = () => {
    if (!capturedUri || !roomId) return;
    if (existingPhoto) {
      Alert.alert(
        '재업로드',
        '이미 오늘 올린 사진이 있습니다. 새 사진으로 교체하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '교체',
            style: 'destructive',
            onPress: () => void doUploadFromCamera(capturedUri),
          },
        ],
      );
    } else {
      void doUploadFromCamera(capturedUri);
    }
  };

  // 갤러리 흐름 — 기존 업로드 로직 유지
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
        '이미 오늘 올린 사진이 있습니다. 새 사진으로 교체하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '교체', style: 'destructive', onPress: doUpload },
        ],
      );
    } else {
      void doUpload();
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
            // Android에서는 borderRadius와 dashed border가 호환되지 않아 solid로 fallback
            borderStyle: Platform.OS === 'android' ? 'solid' : 'dashed',
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
            <Button title="카메라" variant="outlined" onPress={handleCameraCapture} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="갤러리" variant="outlined" onPress={pickFromGallery} />
          </View>
        </View>

        <Button
          title={isUploading ? '업로드 중...' : '업로드'}
          onPress={handleUpload}
          disabled={!photoUri || isUploading}
          size="lg"
        />
      </View>

      {/* 카메라 촬영 후 풀스크린 미리보기 (인스타 스토리 방식) */}
      {capturedUri && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000',
            zIndex: 100,
          }}
        >
          <Image
            source={{ uri: capturedUri }}
            style={{ flex: 1 }}
            contentFit="cover"
          />

          {/* 닫기(X) 버튼 — 미리보기 종료 후 인증하기 화면 복귀 */}
          <View style={{ position: 'absolute', top: 50, left: 16 }}>
            <Pressable
              onPress={() => {
                if (isCameraUploading) return;
                setCapturedUri(null);
              }}
              cssInterop={false}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.5)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 20 }}>✕</Text>
            </Pressable>
          </View>

          {/* 하단 버튼 영역 */}
          <View
            style={{
              position: 'absolute',
              bottom: 40,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Button
                title="다시 촬영"
                variant="outlined"
                onPress={handleRetake}
                disabled={isCameraUploading}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title={isCameraUploading ? '게시 중...' : '게시'}
                variant="filled"
                onPress={handlePost}
                disabled={isCameraUploading}
              />
            </View>
          </View>

          {/* 업로드 중 로딩 오버레이 */}
          {isCameraUploading && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={{ color: '#ffffff', marginTop: 12 }}>사진 업로드 중...</Text>
            </View>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
