# 개발 환경 가이드 (macOS / Windows)

## 개요

| 항목 | macOS | Windows |
|------|-------|---------|
| iOS 시뮬레이터 | ✅ 가능 | ❌ 불가 (Apple 정책) |
| Android 에뮬레이터 | ✅ 가능 | ✅ 가능 |
| 실제 iOS 기기 | ✅ 가능 | ❌ 불가 |
| 실제 Android 기기 | ✅ 가능 | ✅ 가능 |

> iOS 빌드/시뮬레이터는 macOS에서만 가능합니다. Windows에서는 Android 개발만 할 수 있습니다.

---

## macOS 개발 환경

### 사전 설치
- Xcode (App Store) — iOS 시뮬레이터
- Android Studio — Android 에뮬레이터 (선택)
- Node.js (v18 이상)
- CocoaPods: `sudo gem install cocoapods`

### 첫 세팅 (clone 후 최초 1회)

```bash
cd recognize-frontend-reactnative

# 의존성 설치
npm install

# 네이티브 폴더 생성 (ios/, android/ 생성됨)
npx expo prebuild
```

> `prebuild`는 `ios/`, `android/` 폴더 삭제 후 다시 필요할 때만 실행합니다.

---

### iOS 개발 (주력)

```bash
# iOS 시뮬레이터 빌드 & 실행
npx expo run:ios

# 특정 시뮬레이터 지정
npx expo run:ios --simulator "iPhone 16"

# Metro만 따로 시작 (빌드는 Xcode에서)
npx expo start
```

**주의사항**
- `npx expo start`는 직접 실행하지 않고 Expo 앱 또는 `run:ios`로 실행
- 시뮬레이터에서 카카오 로그인 테스트 가능 (실기기 권장)

---

### Android 개발 (macOS)

```bash
# Android Studio 설치 후 에뮬레이터 생성
# AVD Manager → Pixel 8 Pro, API 35 권장

# 에뮬레이터 실행 후
npx expo run:android
```

---

### 백엔드 같이 실행

```bash
# 새 터미널에서
cd recognize-backend-nestjs
npm run start:dev
```

백엔드 기본 주소: `http://localhost:3000`
iOS 시뮬레이터에서 localhost 접근 가능 ✅

---

## Windows 개발 환경

### 사전 설치

1. **Node.js** (v18 이상): https://nodejs.org
2. **Android Studio**: https://developer.android.com/studio
   - 설치 중 `Android SDK`, `Android SDK Platform`, `Android Virtual Device` 체크
3. **JDK 17**: Android Studio 설치 시 자동 포함

### 환경 변수 설정 (Windows)

`시스템 환경 변수` → `ANDROID_HOME` 추가:
```
ANDROID_HOME = C:\Users\<사용자명>\AppData\Local\Android\Sdk
```

`Path`에 추가:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

설정 후 **터미널 재시작**.

---

### 첫 세팅 (clone 후 최초 1회)

```bash
cd recognize-frontend-reactnative

npm install

# android/ 폴더 생성 (ios/는 생성 안 해도 됨)
npx expo prebuild --platform android
```

---

### Android 개발 (Windows)

```bash
# 1. Android Studio에서 에뮬레이터 먼저 실행
#    (AVD Manager → Pixel 8 Pro, API 35 권장)

# 2. 에뮬레이터 실행 중 확인
adb devices

# 3. 앱 빌드 & 실행
npx expo run:android
```

---

### 백엔드 같이 실행 (Windows)

```bash
# 새 터미널에서
cd recognize-backend-nestjs
npm run start:dev
```

**⚠️ 중요**: Android 에뮬레이터에서 `localhost`는 PC가 아닌 에뮬레이터 자신을 가리킵니다.  
백엔드 API 주소를 `10.0.2.2`로 변경해야 합니다.

`src/api/client.ts` (또는 API base URL 설정 파일)에서:
```ts
// macOS (iOS 시뮬레이터)
const BASE_URL = 'http://localhost:3000';

// Windows (Android 에뮬레이터)
const BASE_URL = 'http://10.0.2.2:3000';
```

> 환경 변수(`.env`)로 분리해두면 편리합니다.

---

## 환경별 빠른 명령어 정리

### macOS

| 작업 | 명령어 |
|------|--------|
| iOS 실행 | `npx expo run:ios` |
| Android 실행 | `npx expo run:android` |
| 백엔드 시작 | `npm run start:dev` (백엔드 폴더) |
| 네이티브 재빌드 | `rm -rf ios android && npx expo prebuild` |
| pod 재설치 | `cd ios && pod install` |

### Windows

| 작업 | 명령어 |
|------|--------|
| Android 실행 | `npx expo run:android` |
| 백엔드 시작 | `npm run start:dev` (백엔드 폴더) |
| 네이티브 재빌드 | `npx expo prebuild --platform android --clean` |
| 에뮬레이터 확인 | `adb devices` |

---

## Git 협업 시 주의사항

`ios/`, `android/` 폴더는 `.gitignore`에 포함하는 것을 권장합니다.  
각 환경에서 `npx expo prebuild`로 직접 생성하는 것이 충돌을 방지합니다.

현재 `.gitignore`에 없다면 추가:
```
# Native directories
ios/
android/
```

---

## Docker로 백엔드 실행 (공통)

macOS/Windows 공통으로 DB(PostgreSQL)를 Docker로 실행합니다.

```bash
cd recognize-backend-nestjs
docker-compose up -d
```
