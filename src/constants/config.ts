import { Platform } from 'react-native';

// Android 에뮬레이터에서는 10.0.2.2가 호스트 localhost를 가리킴
const DEV_API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

export const CONFIG = {
  API_URL: __DEV__ ? DEV_API_URL : 'https://api.example.com',
  APP_NAME: 'Recognizer',
} as const;
