# 📁 Recognizer — 앱 기획 기반 폴더 구조 기획서

> **Recognizer**: 프라이빗한 공간에서 서로의 갓생을 인정해주는 앱
> 영감: SETLOG (좋아하는 활동을 기록하고 소셜로 공유하는 구조)
>
> **스타일링**: NativeWind (TailwindCSS for React Native)
> **전역 상태관리**: Zustand

---

## 1. 앱 화면 흐름 (Screen Flow)

```
[앱 시작]
  │
  ├─ 비로그인 상태 ──→ (auth) 로그인 페이지
  │                      ├── 카카오 로그인
  │                      └── 구글 로그인
  │
  └─ 로그인 상태 ──→ (main) 메인 페이지
                       │
                       ├── 내가 속한 방 목록
                       ├── 방 만들기
                       └── 초대 코드로 방 참가
                            │
                            └── 방 페이지 (room/[id])
                                 ├── 오늘의 갓생 카드 피드
                                 │    ├── 사진 배경 카드
                                 │    ├── 업로드 시간 표시
                                 │    └── 인정(✓) / 거절(✗) 투표
                                 ├── 멤버 점수 랭킹
                                 ├── 사진 업로드
                                 └── 방 설정 (초대코드 공유, 나가기 등)
```

---

## 2. 전체 폴더 구조

```
recognizer/
│
├── app/                              # 📱 Expo Router — 라우팅 (얇은 Shell)
│   ├── _layout.tsx                   # 루트 레이아웃 (인증 분기)
│   ├── index.tsx                     # 앱 진입점 → 로그인 여부에 따라 리디렉트
│   │
│   ├── (auth)/                       # 🔐 인증 그룹 (비로그인 유저)
│   │   ├── _layout.tsx               # 인증 스택 레이아웃
│   │   └── login.tsx                 # 소셜 로그인 (카카오/구글)
│   │
│   ├── (main)/                       # 🏠 메인 그룹 (로그인된 유저)
│   │   ├── _layout.tsx               # 메인 스택 레이아웃
│   │   ├── index.tsx                 # 메인 페이지 (방 목록)
│   │   └── create-room.tsx           # 방 만들기 페이지
│   │
│   └── room/                         # 🚪 방 관련 라우트
│       ├── _layout.tsx               # 방 스택 레이아웃
│       ├── [id].tsx                  # 방 메인 페이지 (카드 피드)
│       ├── [id]/
│       │   ├── upload.tsx            # 사진 업로드 페이지
│       │   └── settings.tsx          # 방 설정 (초대코드, 멤버관리)
│       └── join.tsx                  # 초대코드로 방 참가
│
├── src/                              # 💻 소스 코드 루트
│   │
│   ├── features/                     # ── Feature 단위 모듈 ──
│   │   │
│   │   ├── auth/                     # 🔐 인증 Feature
│   │   │   ├── components/
│   │   │   │   ├── LoginScreen.tsx            # 로그인 화면 전체 컴포넌트
│   │   │   │   ├── SocialLoginButton.tsx      # 소셜 로그인 버튼 (카카오/구글)
│   │   │   │   └── LoginHeader.tsx            # 로그인 페이지 헤더/로고
│   │   │   ├── api/
│   │   │   │   └── authApi.ts                 # 소셜 로그인 API (토큰 교환)
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts                 # 인증 상태 관리 훅
│   │   │   └── types/
│   │   │       └── auth.types.ts              # User, AuthToken 등 타입
│   │   │
│   │   ├── room/                     # 🚪 방 Feature (핵심 도메인)
│   │   │   ├── components/
│   │   │   │   ├── RoomListScreen.tsx          # 메인 - 방 목록 화면
│   │   │   │   ├── RoomCard.tsx                # 방 목록의 개별 방 카드
│   │   │   │   ├── CreateRoomForm.tsx          # 방 만들기 폼
│   │   │   │   ├── JoinRoomForm.tsx            # 초대코드 입력 폼
│   │   │   │   ├── RoomHeader.tsx              # 방 페이지 상단 (방 이름, 설정)
│   │   │   │   ├── InviteCodeModal.tsx         # 초대코드 공유 모달
│   │   │   │   └── MemberList.tsx              # 멤버 목록 + 점수 랭킹
│   │   │   ├── api/
│   │   │   │   └── roomApi.ts                  # 방 CRUD, 참가, 초대코드 API
│   │   │   ├── hooks/
│   │   │   │   ├── useRoom.ts                  # 방 상세 데이터 훅
│   │   │   │   └── useRoomList.ts              # 방 목록 데이터 훅
│   │   │   └── types/
│   │   │       └── room.types.ts               # Room, Member, InviteCode 타입
│   │   │
│   │   └── recognition/             # ✅ 인정(갓생 인증) Feature (핵심 도메인)
│   │       ├── components/
│   │       │   ├── RecognitionFeed.tsx          # 방 내 오늘의 카드 피드
│   │       │   ├── RecognitionCard.tsx          # 개별 갓생 카드 (사진+시간)
│   │       │   ├── VoteOverlay.tsx              # ✓/✗ 투표 오버레이 UI
│   │       │   ├── PhotoUploadScreen.tsx        # 사진 촬영/선택 + 업로드
│   │       │   ├── ScoreBoard.tsx               # 점수 랭킹 보드
│   │       │   └── EmptyFeed.tsx                # 오늘 아직 인증 없을 때
│   │       ├── api/
│   │       │   └── recognitionApi.ts            # 인증 업로드, 투표, 점수 조회 API
│   │       ├── hooks/
│   │       │   ├── useRecognitionFeed.ts        # 피드 데이터 + 페이징
│   │       │   ├── useVote.ts                   # 투표 로직 훅
│   │       │   └── usePhotoUpload.ts            # 사진 선택/업로드 훅
│   │       └── types/
│   │           └── recognition.types.ts         # Recognition, Vote, Score 타입
│   │
│   ├── components/                   # ── 공용 컴포넌트 ──
│   │   ├── ui/
│   │   │   ├── Button.tsx                      # 공용 버튼
│   │   │   ├── Input.tsx                       # 공용 인풋 (초대코드 입력 등)
│   │   │   ├── Text.tsx                        # 타이포그래피 래퍼
│   │   │   ├── Card.tsx                        # 기본 카드 컨테이너
│   │   │   ├── Avatar.tsx                      # 유저 아바타
│   │   │   ├── Modal.tsx                       # 공용 모달
│   │   │   ├── Badge.tsx                       # 점수/알림 뱃지
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/
│   │   │   ├── ScreenContainer.tsx             # SafeArea + 기본 패딩 래퍼
│   │   │   ├── KeyboardAvoidingWrapper.tsx      # 키보드 회피 래퍼
│   │   │   └── index.ts
│   │   │
│   │   └── feedback/
│   │       ├── Toast.tsx                       # 토스트 알림
│   │       ├── Loading.tsx                     # 로딩 스피너
│   │       └── index.ts
│   │
│   ├── hooks/                        # ── 공용 훅 ──
│   │   ├── useImagePicker.ts                   # 카메라/갤러리 이미지 선택
│   │   └── useAppState.ts                      # 앱 포/백그라운드 상태
│   │
│   ├── api/                          # ── 공용 API 레이어 ──
│   │   ├── client.ts                           # HTTP 클라이언트 (axios/fetch)
│   │   ├── interceptors.ts                     # 토큰 자동 주입, 401 처리
│   │   └── endpoints.ts                        # BASE_URL, API 경로 상수
│   │
│   ├── stores/                       # ── 전역 상태 관리 (Zustand) ──
│   │   ├── authStore.ts                        # 로그인 상태, 유저 정보, 토큰
│   │   ├── appStore.ts                         # 앱 전역 상태 (현재 방 등)
│   │   └── middleware.ts                       # Zustand 미들웨어 (persist 등)
│   │
│   ├── types/                        # ── 공용 타입 ──
│   │   ├── api.types.ts                        # API Response 공통 래퍼 타입
│   │   └── common.types.ts                     # 공용 유틸 타입
│   │
│   ├── utils/                        # ── 공용 유틸 ──
│   │   ├── storage.ts                          # AsyncStorage 래퍼 (토큰 저장)
│   │   ├── format.ts                           # 시간 포맷 ("오후 3:42")
│   │   └── platform.ts                         # iOS/Android 분기
│   │
│   └── constants/                    # ── 상수 ──
│       └── config.ts                           # API URL, 앱 설정값
│
├── design/                           # 🎨 디자인 시스템 (Tailwind 토큰과 연동)
│   ├── tokens/
│   │   ├── colors.ts                           # tailwind.config.js와 동기화된 색상
│   │   ├── typography.ts                       # 폰트 패밀리, Tailwind 커스텀 폰트
│   │   ├── spacing.ts                          # Tailwind spacing 스케일 확장값
│   │   └── index.ts
│   │
│   ├── theme/
│   │   ├── ThemeProvider.tsx                   # 다크모드 Context Provider
│   │   ├── useTheme.ts                         # 현재 테마 + 토글 훅
│   │   └── index.ts
│   │
│   └── index.ts
│
├── assets/                           # 📦 정적 에셋
│   ├── images/
│   │   ├── icon.png
│   │   ├── splash-icon.png
│   │   ├── logo.png
│   │   ├── kakao-logo.png                     # 카카오 로그인 아이콘
│   │   └── google-logo.png                    # 구글 로그인 아이콘
│   │
│   └── fonts/
│       ├── Pretendard-Regular.otf
│       ├── Pretendard-Medium.otf
│       ├── Pretendard-SemiBold.otf
│       └── Pretendard-Bold.otf
│
├── docs/                             # 📄 프로젝트 문서
│
├── app.json
├── tsconfig.json
├── tailwind.config.js                    # TailwindCSS 설정 (NativeWind)
├── global.css                            # Tailwind 디렉티브 (@tailwind base 등)
├── nativewind-env.d.ts                   # NativeWind 타입 선언
├── metro.config.js                       # Metro 번들러 설정 (NativeWind 연동)
├── babel.config.js                       # Babel 설정 (NativeWind 프리셋)
├── eslint.config.js
├── package.json
└── .gitignore
```

---

## 3. Feature별 책임 범위

### 3.1 `auth` Feature — 인증

| 항목 | 설명 |
|------|------|
| **화면** | 로그인 (카카오/구글 소셜 로그인) |
| **API** | 소셜 토큰 → 서버 토큰 교환, 로그아웃 |
| **상태** | `authStore`에 유저 정보 + 토큰 저장 |
| **자체 회원가입 없음** | 소셜 로그인만 지원 → 별도 register 페이지 불필요 |

```tsx
// app/(auth)/login.tsx
import { LoginScreen } from '@/src/features/auth/components/LoginScreen';
export default LoginScreen;
```

### 3.2 `room` Feature — 방 관리

| 항목 | 설명 |
|------|------|
| **화면** | 방 목록(메인), 방 만들기, 초대코드로 참가, 방 설정 |
| **API** | 방 생성, 방 목록 조회, 초대코드 생성/검증, 방 참가/나가기 |
| **핵심 로직** | 초대코드 기반 프라이빗 방 시스템 |

```tsx
// app/(main)/index.tsx — 메인 페이지(방 목록)
import { RoomListScreen } from '@/src/features/room/components/RoomListScreen';
export default RoomListScreen;
```

### 3.3 `recognition` Feature — 갓생 인정 (핵심 도메인)

| 항목 | 설명 |
|------|------|
| **화면** | 카드 피드, 사진 업로드, 투표 오버레이, 점수 보드 |
| **API** | 갓생 사진 업로드, 투표(인정/거절), 점수 조회 |
| **핵심 로직** | 사진 카드 + 시간 표시, ✓/✗ 투표, 점수 집계 |

```tsx
// app/room/[id].tsx — 방 메인 (카드 피드)
import { RecognitionFeed } from '@/src/features/recognition/components/RecognitionFeed';
import { ScoreBoard } from '@/src/features/recognition/components/ScoreBoard';
import { RoomHeader } from '@/src/features/room/components/RoomHeader';
// room + recognition feature를 조합하여 화면 구성
```

---

## 4. 기술 스택 상세

### 4.1 NativeWind (TailwindCSS)

React Native에서 TailwindCSS 문법을 사용할 수 있게 해주는 라이브러리.
`StyleSheet.create()` 대신 `className` prop으로 스타일링한다.

```tsx
// ❌ 기존 StyleSheet 방식
<View style={styles.container}>
  <Text style={styles.title}>인정!</Text>
</View>

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#212121' },
});

// ✅ NativeWind 방식
<View className="flex-1 p-4 bg-white">
  <Text className="text-2xl font-bold text-gray-900">인정!</Text>
</View>
```

**`tailwind.config.js`** 에서 디자인 토큰(색상, 폰트, 간격)을 정의하면 Tailwind 클래스로 바로 사용 가능:

```js
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{tsx,ts}', './src/**/*.{tsx,ts}', './design/**/*.{tsx,ts}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2196F3', dark: '#1976D2' },
        surface: '#FAFAFA',
      },
      fontFamily: {
        pretendard: ['Pretendard-Regular'],
        'pretendard-medium': ['Pretendard-Medium'],
        'pretendard-semibold': ['Pretendard-SemiBold'],
        'pretendard-bold': ['Pretendard-Bold'],
      },
    },
  },
  plugins: [],
};
```

→ 사용: `className="bg-primary text-white font-pretendard-bold"`

### 4.2 Zustand (전역 상태관리)

가벼운 전역 상태관리 라이브러리. Redux 대비 보일러플레이트가 거의 없음.

```ts
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/src/features/auth/types/auth.types';

type AuthState = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      setAuth: (user, token) => set({ user, token, isLoggedIn: true }),
      logout: () => set({ user: null, token: null, isLoggedIn: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

```ts
// src/stores/appStore.ts
import { create } from 'zustand';

type AppState = {
  currentRoomId: string | null;
  setCurrentRoom: (roomId: string) => void;
  clearCurrentRoom: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  currentRoomId: null,
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),
  clearCurrentRoom: () => set({ currentRoomId: null }),
}));
```

---

## 5. 핵심 타입 정의 (미리보기)

```ts
// src/features/auth/types/auth.types.ts
type User = {
  id: string;
  nickname: string;
  profileImage: string | null;
  provider: 'kakao' | 'google';
};

// src/features/room/types/room.types.ts
type Room = {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  members: RoomMember[];
  createdAt: string;
};

type RoomMember = {
  userId: string;
  nickname: string;
  profileImage: string | null;
  totalScore: number;
};

// src/features/recognition/types/recognition.types.ts
type Recognition = {
  id: string;
  roomId: string;
  userId: string;
  nickname: string;
  photoUrl: string;
  uploadedAt: string;           // "2026-04-13T15:42:00Z"
  votes: Vote[];
  recognizedCount: number;      // 인정받은 수
};

type Vote = {
  voterId: string;
  value: 'recognize' | 'reject';   // ✓ 또는 ✗
};
```

---

## 6. 라우팅 & 네비게이션 흐름

```
app/_layout.tsx (Root)
  │
  ├─ 비로그인 → (auth)/_layout.tsx [Stack]
  │               └── login.tsx
  │
  └─ 로그인됨 → (main)/_layout.tsx [Stack]
                  ├── index.tsx          ← 방 목록 (메인)
                  ├── create-room.tsx    ← 방 만들기
                  │
                  └── room/_layout.tsx [Stack]
                       ├── join.tsx           ← 초대코드 참가
                       ├── [id].tsx           ← 방 피드 (카드+투표+점수)
                       ├── [id]/upload.tsx    ← 사진 업로드
                       └── [id]/settings.tsx  ← 방 설정
```

### 인증 분기 (Root Layout)

```tsx
// app/_layout.tsx
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { Redirect, Stack } from 'expo-router';

export default function RootLayout() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="(main)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
```

---

## 7. 공용 vs Feature 전용 컴포넌트 분류

| 컴포넌트 | 위치 | 이유 |
|----------|------|------|
| `Button` | `src/components/ui/` | 모든 화면에서 사용 |
| `Input` | `src/components/ui/` | 여러 화면에서 사용 (초대코드, 방이름 등) |
| `Card` | `src/components/ui/` | 방 카드 + 갓생 카드 모두 사용 |
| `Avatar` | `src/components/ui/` | 멤버 표시에 범용 사용 |
| `Modal` | `src/components/ui/` | 초대코드 모달 등 범용 |
| `SocialLoginButton` | `src/features/auth/` | 로그인에서만 사용 |
| `RecognitionCard` | `src/features/recognition/` | 방 피드에서만 사용 |
| `VoteOverlay` | `src/features/recognition/` | 카드 투표에서만 사용 |
| `RoomCard` | `src/features/room/` | 방 목록에서만 사용 |
| `InviteCodeModal` | `src/features/room/` | 방 설정에서만 사용 |
| `MemberList` | `src/features/room/` | 방 내부에서만 사용 |

---

## 8. MVP 구현 우선순위

| 단계 | 작업 | 산출물 |
|------|------|--------|
| **1단계** | NativeWind + Tailwind 설정 | `tailwind.config.js`, `global.css`, `metro.config.js` |
| **2단계** | 디자인 토큰 + 테마 | `design/` 폴더, Tailwind 커스텀 컬러/폰트 |
| **3단계** | 공용 UI 컴포넌트 | `Button`, `Input`, `Card`, `Avatar`, `Modal` |
| **4단계** | API 클라이언트 + Zustand 스토어 | `src/api/`, `src/stores/authStore.ts` |
| **5단계** | **auth feature** | 카카오/구글 소셜 로그인 |
| **6단계** | **room feature** | 방 목록, 방 생성, 초대코드 참가 |
| **7단계** | **recognition feature** | 사진 업로드, 카드 피드, 투표, 점수 |
| **8단계** | 방 설정 + 부가 기능 | 멤버 관리, 방 나가기 등 |
