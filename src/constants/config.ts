import { Platform } from 'react-native';

// 운영 백엔드 (AWS EC2). 로컬 백엔드를 쓸 일이 생기면 EXPO_PUBLIC_API_URL 로 덮어쓰면 됨.
const PROD_API_URL = 'https://api.lookup-app.co.kr';

// EAS build 시 EXPO_PUBLIC_API_URL 이 주입됨 (eas.json env). 미지정 시 운영 URL fallback.
const API_URL = process.env.EXPO_PUBLIC_API_URL || PROD_API_URL;

// Platform 참조 (린트 무관, 추후 플랫폼별 분기 필요 시 사용)
void Platform;

export const CONFIG = {
  API_URL,
  APP_NAME: 'Lookup',
} as const;
