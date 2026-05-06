import { Platform } from 'react-native';

// Android 에뮬레이터에서는 10.0.2.2가 호스트 localhost를 가리킴
// iOS 실기기 + 핫스팟 환경에서는 ngrok 터널 주소 사용: ngrok http 3000
const DEV_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://192.168.35.157:3000';

// EAS build 시 EXPO_PUBLIC_API_URL 이 주입됨 (eas.json env). 미지정 시 dev fallback.
const API_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? DEV_API_URL : '');

if (!API_URL) {
  // 운영 빌드인데 EXPO_PUBLIC_API_URL 누락 → 즉시 인지할 수 있도록 throw
  throw new Error(
    'EXPO_PUBLIC_API_URL 환경변수가 설정되지 않았습니다. eas.json의 env를 확인하세요.',
  );
}

export const CONFIG = {
  API_URL,
  APP_NAME: 'Lookup',
} as const;
