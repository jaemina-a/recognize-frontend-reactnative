import { ScreenContainer } from '@/src/components/layout';
import { Button, Text } from '@/src/components/ui';
import { View } from 'react-native';

export function PhotoUploadScreen() {
  // TODO: useImagePicker, usePhotoUpload 연동

  return (
    <ScreenContainer>
      <View className="flex-1 px-5 pt-8">
        <Text variant="h2" className="mb-6">갓생 인증하기</Text>

        {/* 사진 미리보기 영역 */}
        <View className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl h-72 items-center justify-center mb-6">
          <Text className="text-4xl mb-2">📸</Text>
          <Text variant="caption">사진을 선택하세요</Text>
        </View>

        <View className="flex-row gap-3 mb-6">
          <Button
            title="카메라"
            variant="outlined"
            className="flex-1"
            onPress={() => console.log('카메라')}
          />
          <Button
            title="갤러리"
            variant="outlined"
            className="flex-1"
            onPress={() => console.log('갤러리')}
          />
        </View>

        <Button title="업로드" onPress={() => console.log('업로드')} />
      </View>
    </ScreenContainer>
  );
}
