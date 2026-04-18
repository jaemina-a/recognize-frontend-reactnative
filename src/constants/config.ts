import { Platform } from 'react-native';

// Android 에뮬레이터에서는 10.0.2.2가 호스트 localhost를 가리킴
// iOS 실기기에서는 맥북의 실제 IP 주소를 사용해야 함
const DEV_API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://192.168.35.157:3000';

export const CONFIG = {
  API_URL: __DEV__ ? DEV_API_URL : 'https://api.example.com',
  APP_NAME: 'Recognizer',
} as const;
