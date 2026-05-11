import type { ExpoConfig, ConfigContext } from '@expo/config';

/**
 * EAS / expo-cli 가 호출하는 동적 앱 설정.
 * - 환경변수: EXPO_PUBLIC_API_URL (필수, eas.json profile별 주입)
 * - 환경변수: EXPO_PUBLIC_KAKAO_APP_KEY (선택, 미지정 시 fallback)
 * - 환경변수: APP_VARIANT = 'development' | 'preview' | 'production'
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT ?? 'development';
  const isProduction = variant === 'production';

  const kakaoAppKey =
    process.env.EXPO_PUBLIC_KAKAO_APP_KEY ?? 'a40536ace195bc9faa45b942a2713547';

  return {
    ...config,
    name: isProduction ? 'Lookup' : variant === 'preview' ? 'Lookup (Preview)' : 'Lookup (Dev)',
    slug: 'lookup',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'lookup',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    owner: 'jaemine',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.lookup.app',
      buildNumber: '1',
      infoPlist: {
        NSCameraUsageDescription: '오늘의 갓생 사진을 촬영하기 위해 카메라 접근이 필요합니다.',
        NSPhotoLibraryUsageDescription:
          '프로필 및 인증 사진을 등록하기 위해 사진 라이브러리 접근이 필요합니다.',
        NSPhotoLibraryAddUsageDescription:
          '저장한 사진을 사진 라이브러리에 추가하기 위해 접근이 필요합니다.',
      },
    },
    android: {
      package: 'com.lookup.app',
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: '#A9CCEC',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      [
        '@react-native-seoul/kakao-login',
        {
          kakaoAppKey,
          kotlinVersion: '2.1.21',
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            kotlinVersion: '2.1.21',
            extraMavenRepos: ['https://devrepo.kakao.com/nexus/content/groups/public/'],
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      variant,
      eas: {
        projectId: 'b7dc5447-18b9-4a13-a27a-f15a5f64e8ae',
      },
    },
  };
};
