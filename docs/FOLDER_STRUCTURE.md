# 📁 Recognizer — 폴더 구조 & 디자인 시스템 기획서

## 1. 전체 폴더 구조

```
recognizer/
├── app/                          # Expo Router — 파일 기반 라우팅(스크린 정의)
│   ├── _layout.tsx               # 루트 레이아웃 (네비게이션 스택/탭 설정)
│   ├── index.tsx                 # 홈 스크린 (Entry Point)
│   │
│   ├── (auth)/                   # 인증 관련 스크린 그룹
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (tabs)/                   # 탭 네비게이션 그룹
│   │   ├── _layout.tsx           # BottomTab 레이아웃
│   │   ├── home.tsx
│   │   ├── search.tsx
│   │   ├── profile.tsx
│   │   └── settings.tsx
│   │
│   └── [id].tsx                  # 동적 라우트 예시
│
├── src/                          # 소스 코드 루트
│   │
│   ├── features/                 # 🔑 Feature(스크린) 단위 모듈
│   │   ├── auth/                 # 인증 Feature
│   │   │   ├── components/       # auth 전용 컴포넌트
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── SocialLoginButton.tsx
│   │   │   ├── api/              # auth 전용 API 호출
│   │   │   │   └── authApi.ts
│   │   │   ├── hooks/            # auth 전용 훅
│   │   │   │   └── useAuth.ts
│   │   │   ├── types/            # auth 전용 타입
│   │   │   │   └── auth.types.ts
│   │   │   └── utils/            # auth 전용 유틸
│   │   │       └── validation.ts
│   │   │
│   │   ├── home/                 # 홈 Feature
│   │   │   ├── components/
│   │   │   ├── api/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   │
│   │   ├── profile/              # 프로필 Feature
│   │   │   ├── components/
│   │   │   ├── api/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   │
│   │   └── settings/             # 설정 Feature
│   │       ├── components/
│   │       ├── api/
│   │       └── hooks/
│   │
│   ├── components/               # 🧩 공용(Shared) 컴포넌트
│   │   ├── ui/                   # 기본 UI 원자 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Text.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Divider.tsx
│   │   │   └── index.ts          # barrel export
│   │   │
│   │   ├── layout/               # 레이아웃 컴포넌트
│   │   │   ├── SafeAreaWrapper.tsx
│   │   │   ├── KeyboardAvoidingWrapper.tsx
│   │   │   ├── ScreenContainer.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── feedback/             # 피드백 컴포넌트
│   │       ├── Toast.tsx
│   │       ├── Loading.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                    # 공용 커스텀 훅
│   │   ├── useDebounce.ts
│   │   ├── useKeyboard.ts
│   │   └── useAppState.ts
│   │
│   ├── api/                      # 공용 API 레이어
│   │   ├── client.ts             # axios/fetch 인스턴스 설정
│   │   ├── interceptors.ts       # 요청/응답 인터셉터
│   │   └── endpoints.ts          # API 엔드포인트 상수
│   │
│   ├── stores/                   # 전역 상태 관리 (Zustand / Context)
│   │   ├── authStore.ts
│   │   └── appStore.ts
│   │
│   ├── types/                    # 공용 타입 정의
│   │   ├── common.types.ts
│   │   ├── api.types.ts
│   │   └── navigation.types.ts
│   │
│   ├── utils/                    # 공용 유틸 함수
│   │   ├── storage.ts            # AsyncStorage 래퍼
│   │   ├── format.ts             # 날짜/숫자 포맷
│   │   └── platform.ts           # 플랫폼 분기 유틸
│   │
│   └── constants/                # 앱 상수
│       ├── config.ts             # 환경변수, 앱 설정
│       └── routes.ts             # 라우트 경로 상수
│
├── design/                       # 🎨 디자인 시스템
│   ├── tokens/                   # 디자인 토큰 (가장 작은 단위)
│   │   ├── colors.ts             # 색상 팔레트 & 시맨틱 컬러
│   │   ├── typography.ts         # 폰트 패밀리, 사이즈, weight
│   │   ├── spacing.ts            # 간격 스케일 (4, 8, 12, 16...)
│   │   ├── radius.ts             # border-radius 스케일
│   │   ├── shadows.ts            # 그림자 스타일
│   │   └── index.ts              # barrel export
│   │
│   ├── theme/                    # 테마 설정
│   │   ├── lightTheme.ts         # 라이트 모드 테마
│   │   ├── darkTheme.ts          # 다크 모드 테마
│   │   ├── ThemeProvider.tsx      # 테마 Context Provider
│   │   ├── useTheme.ts           # 테마 사용 훅
│   │   └── index.ts
│   │
│   └── index.ts                  # 디자인 시스템 통합 export
│
├── assets/                       # 정적 에셋
│   ├── images/                   # 이미지 (png, jpg, svg)
│   │   ├── icon.png
│   │   ├── splash-icon.png
│   │   └── logo.png
│   │
│   └── fonts/                    # 커스텀 폰트 파일
│       ├── Pretendard-Regular.otf
│       ├── Pretendard-Medium.otf
│       ├── Pretendard-SemiBold.otf
│       └── Pretendard-Bold.otf
│
├── docs/                         # 프로젝트 문서
│
├── app.json                      # Expo 앱 설정
├── tsconfig.json                 # TypeScript 설정
├── eslint.config.js              # ESLint 설정
├── package.json                  # 의존성 관리
└── .gitignore
```

---

## 2. 폴더 구조 설계 원칙

### 2.1 Feature-Based Architecture (기능 기반 구조)

| 원칙 | 설명 |
|------|------|
| **Co-location** | 관련 코드를 같은 폴더에 배치하여 응집도를 높임 |
| **Feature 독립성** | 각 feature는 자신의 components, api, hooks, types를 가짐 |
| **공유 최소화** | 2개 이상 feature에서 쓰이는 것만 공용 폴더로 승격 |
| **단방향 의존성** | `feature → shared`, `shared ↛ feature` |

### 2.2 `app/` vs `src/` 분리 이유

```
app/   → "어떤 화면이 있는가" (라우팅, 네비게이션)
src/   → "화면이 무엇으로 구성되는가" (비즈니스 로직, UI)
```

- `app/` 디렉토리의 스크린 파일은 **얇은 Shell** 역할만 수행
- 실제 UI와 로직은 `src/features/`에서 가져와 조립

```tsx
// app/(tabs)/home.tsx — 얇은 Shell
import { HomeScreen } from '@/src/features/home/components/HomeScreen';
export default HomeScreen;
```

### 2.3 공용 컴포넌트 승격 기준

```
1. 한 feature에서만 쓰임 → src/features/{name}/components/
2. 두 feature 이상에서 쓰임 → src/components/
3. 앱 전체 디자인 시스템 → design/
```

---

## 3. 디자인 시스템 설계

### 3.1 디자인 토큰 구조

#### `design/tokens/colors.ts`

```ts
// 원시 색상 팔레트 (변하지 않는 값)
export const palette = {
  blue50: '#E6F4FE',
  blue100: '#B3DFFC',
  blue500: '#2196F3',
  blue600: '#1E88E5',
  blue700: '#1976D2',
  
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray500: '#9E9E9E',
  gray700: '#616161',
  gray900: '#212121',
  
  white: '#FFFFFF',
  black: '#000000',

  red500: '#F44336',
  green500: '#4CAF50',
  yellow500: '#FFC107',
} as const;

// 시맨틱 컬러 (의미 기반 — 테마에서 오버라이드)
export const semanticColors = {
  primary: palette.blue500,
  primaryDark: palette.blue700,
  
  background: palette.white,
  surface: palette.gray50,
  
  textPrimary: palette.gray900,
  textSecondary: palette.gray700,
  textDisabled: palette.gray500,
  
  border: palette.gray200,
  divider: palette.gray300,
  
  error: palette.red500,
  success: palette.green500,
  warning: palette.yellow500,
} as const;
```

#### `design/tokens/typography.ts`

```ts
import { Platform } from 'react-native';

export const fontFamily = {
  regular: Platform.select({
    ios: 'Pretendard-Regular',
    android: 'Pretendard-Regular',
  }),
  medium: Platform.select({
    ios: 'Pretendard-Medium',
    android: 'Pretendard-Medium',
  }),
  semibold: Platform.select({
    ios: 'Pretendard-SemiBold',
    android: 'Pretendard-SemiBold',
  }),
  bold: Platform.select({
    ios: 'Pretendard-Bold',
    android: 'Pretendard-Bold',
  }),
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
  '4xl': 44,
} as const;

// 미리 정의된 텍스트 스타일 프리셋
export const textStyles = {
  h1: { fontFamily: fontFamily.bold, fontSize: fontSize['3xl'], lineHeight: lineHeight['3xl'] },
  h2: { fontFamily: fontFamily.bold, fontSize: fontSize['2xl'], lineHeight: lineHeight['2xl'] },
  h3: { fontFamily: fontFamily.semibold, fontSize: fontSize.xl, lineHeight: lineHeight.xl },
  body1: { fontFamily: fontFamily.regular, fontSize: fontSize.md, lineHeight: lineHeight.md },
  body2: { fontFamily: fontFamily.regular, fontSize: fontSize.sm, lineHeight: lineHeight.sm },
  caption: { fontFamily: fontFamily.regular, fontSize: fontSize.xs, lineHeight: lineHeight.xs },
  button: { fontFamily: fontFamily.semibold, fontSize: fontSize.md, lineHeight: lineHeight.md },
} as const;
```

#### `design/tokens/spacing.ts`

```ts
// 4px 기반 스케일
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;
```

#### `design/tokens/radius.ts`

```ts
export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
```

#### `design/tokens/shadows.ts`

```ts
import { Platform } from 'react-native';

export const shadows = {
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    android: { elevation: 1 },
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    android: { elevation: 3 },
  }),
  lg: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
    android: { elevation: 6 },
  }),
} as const;
```

### 3.2 테마 시스템

#### `design/theme/lightTheme.ts`

```ts
import { palette, semanticColors } from '../tokens/colors';

export const lightTheme = {
  colors: {
    ...semanticColors,
    background: palette.white,
    surface: palette.gray50,
    textPrimary: palette.gray900,
    textSecondary: palette.gray700,
  },
} as const;
```

#### `design/theme/darkTheme.ts`

```ts
import { palette } from '../tokens/colors';

export const darkTheme = {
  colors: {
    primary: palette.blue500,
    primaryDark: palette.blue600,
    background: '#121212',
    surface: '#1E1E1E',
    textPrimary: palette.white,
    textSecondary: palette.gray300,
    border: '#2C2C2C',
    divider: '#383838',
    error: palette.red500,
    success: palette.green500,
    warning: palette.yellow500,
  },
} as const;
```

---

## 4. Import Path Alias 규칙

`tsconfig.json`의 `@/*` alias를 활용한 import 규칙:

```ts
// ✅ Good
import { Button } from '@/src/components/ui';
import { colors } from '@/design/tokens';
import { LoginForm } from '@/src/features/auth/components/LoginForm';

// ❌ Bad — 상대경로 지옥
import { Button } from '../../../components/ui';
```

---

## 5. 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `Button.tsx`, `LoginForm.tsx` |
| 훅 파일 | camelCase, `use` prefix | `useAuth.ts`, `useDebounce.ts` |
| API 파일 | camelCase, `Api` suffix | `authApi.ts`, `userApi.ts` |
| 타입 파일 | camelCase, `.types.ts` suffix | `auth.types.ts` |
| 유틸 파일 | camelCase | `format.ts`, `validation.ts` |
| 상수 파일 | camelCase | `config.ts`, `routes.ts` |
| 디자인 토큰 | camelCase | `colors.ts`, `spacing.ts` |
| 라우트 파일 (`app/`) | kebab-case | `forgot-password.tsx` |
| barrel export | `index.ts` | 각 폴더의 `index.ts` |

---

## 6. MVP 우선순위 폴더 생성 순서

| 단계 | 생성 대상 | 이유 |
|------|-----------|------|
| **1단계** | `design/tokens/`, `design/theme/` | 디자인 시스템은 모든 UI의 기반 |
| **2단계** | `src/components/ui/` | 공용 버튼, 인풋 등 기본 컴포넌트 |
| **3단계** | `src/api/`, `src/stores/` | API 클라이언트와 상태관리 기반 |
| **4단계** | `src/features/auth/` | 인증은 대부분의 앱에서 첫 번째 feature |
| **5단계** | 나머지 features | MVP 범위의 스크린별 feature |
