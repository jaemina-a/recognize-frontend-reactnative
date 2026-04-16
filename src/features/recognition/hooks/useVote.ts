import { useState } from 'react';
import { Alert } from 'react-native';
import { recognitionApi } from '../api/recognitionApi';

export function useRecognize() {
  const [isRecognizing, setIsRecognizing] = useState(false);

  const recognize = async (photoId: string) => {
    try {
      setIsRecognizing(true);
      const result = await recognitionApi.recognizePhoto(photoId);
      return result;
    } catch (error: any) {
      const msg = error?.message || '';
      if (msg.includes('409') || msg.includes('이미')) {
        Alert.alert('알림', '이미 인정되었습니다.');
      } else if (msg.includes('403') || msg.includes('본인')) {
        Alert.alert('알림', '본인의 사진은 인정할 수 없습니다.');
      } else {
        Alert.alert('오류', '인정 처리에 실패했습니다.');
      }
      throw error;
    } finally {
      setIsRecognizing(false);
    }
  };

  return { recognize, isRecognizing };
}
