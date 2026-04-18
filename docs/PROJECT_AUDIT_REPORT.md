# React Native 프로젝트 전수점검 보고서

> **대상 프로젝트**: `recognize-frontend-reactnative`
> **점검 일자**: 2026-04-18
> **점검 범위**: `app/`, `src/`, `design/`, 설정 파일 전체
> **점검 방식**: 정적 코드 분석 (read-only) — 코드 수정 없음

---

## 0. 프로젝트 개요

```
app/                          (Expo Router 기반 라우팅)
├── (auth)/login.tsx
├── (main)/                  (index.tsx, create-room.tsx)
├── room/                    (join.tsx, [id]/{index,upload,settings,calendar}.tsx)
└── _layout.tsx              (RootLayout)

src/
├── api/                     (client.ts, endpoints.ts, interceptors.ts)
├── components/
│   ├── ui/                  (Button, Card, Input, Avatar, Badge, BottomSheet 등 11개)
│   └── layout/              (ScreenContainer, KeyboardAvoidingWrapper)
├── features/
│   ├── auth/                (LoginScreen, hooks, types, api)
│   ├── room/                (RoomListScreen, forms, settings)
│   └── recognition/         (PhotoUpload, Calendar, Feed 등)
├── hooks/                   (useImagePicker, useAppState)
├── stores/                  (authStore, appStore)
├── types/                   (api.types, common.types)
├── utils/                   (format, platform, storage)
└── constants/               (config.ts)

design/
├── tokens/                  (colors, elevation, motion, shape, spacing, typography)
└── theme/                   (ThemeProvider, useTheme)
```

전반적으로 **feature-based 아키텍처**가 잘 정착되어 있고 Material Design 3 토큰 시스템이 일관성 있게 적용된 상태이다. 다만 보안·환경설정·서버 상태 캐싱·이미지 피커 등 **운영 단계로 가기 위한 핵심 인프라**가 미완성이다.

---

## 1. 폴더 구조 및 프로젝트 아키텍처

### 현재 상태 요약
- `src/features/{auth,room,recognition}` 형태의 **feature-based 구조**가 일관되게 유지됨
- 공용 코드(`src/components/ui`, `src/components/layout`, `design/`)와 기능 전용 코드 분리가 명확함
- 경로 별칭(`@/src/...`, `@/design/...`)이 100% 일관 적용
- 라우팅 파일(`app/`)은 대부분 1줄짜리 thin wrapper로 비즈니스 로직과 분리됨

### 발견된 문제점
1. **`src/hooks/`와 `src/features/*/hooks/` 역할 혼재** — 전역 훅이어야 할 [useImagePicker.ts](../src/hooks/useImagePicker.ts)가 사실은 recognition 피처 전용
2. **Dead code/placeholder**
   - [src/utils/storage.ts](../src/utils/storage.ts) — 실사용처 없음
   - [src/stores/middleware.ts](../src/stores/middleware.ts) — 주석만 남은 빈 파일
   - [src/types/common.types.ts](../src/types/common.types.ts) — `Nullable<T>` 정의되어 있으나 참조 없음
3. **feature 단위 barrel export 부재** — `src/features/*/index.ts`가 없어 import 경로가 길어짐 (`@/src/features/auth/components/LoginScreen`)

### 왜 문제인가
- 새 기능 추가 시 "전역 훅인가, 피처 훅인가"의 판단 기준이 모호해 향후 같은 혼란이 반복될 위험
- Dead code는 신규 개발자에게 잘못된 신호를 줌(쓰는 것처럼 보임)
- barrel export 부재로 리팩토링 시 변경 범위가 넓어짐

### 개선 방향
- `useImagePicker`를 `src/features/recognition/hooks/`로 이동
- placeholder 파일 3종 즉시 삭제 또는 실제 구현 채우기
- 각 feature 루트에 `index.ts` 추가 (`export * from './components'` 등)

### 우선순위
**중간** — 구조 자체는 안정적이나 일관성 유지를 위해 정리 필요

---

## 2. 책임 분리 및 코드 구조

### 현재 상태 요약
- `app/` 하위 라우팅 파일은 대부분 `<XxxScreen />`만 호출하는 1줄 wrapper
- 비즈니스 로직은 feature 내부의 hooks(`useRoom`, `useCalendar`, `useRecognize` 등)로 분리
- 화면 컴포넌트의 평균 길이가 60~130줄로 적정

### 발견된 문제점

| 파일 | 길이 | 비고 |
|------|------|------|
| [SwipeableCalendarGrid.tsx](../src/features/recognition/components/SwipeableCalendarGrid.tsx) | **255줄** | 제스처 + 애니메이션 + 그리드 렌더 동시 책임 |
| [MonthYearPicker.tsx](../src/features/recognition/components/MonthYearPicker.tsx) | **220줄** | scroll settle/snap 로직이 컴포넌트 내부에 혼재 |
| [useCalendar.ts](../src/features/recognition/hooks/useCalendar.ts) | 108줄 | dual-tier 캐싱(cacheRef/inflightRef) 적정 |

1. **`MonthYearPicker.tsx`**: 4개의 ref(`scrollRef`, `hasInitializedRef`, `programmaticSnapRef`, `settleTimerRef`)와 `Platform.OS !== 'web'` 분기가 한 컴포넌트 안에 모두 존재
2. **에러 처리가 hook과 component 양쪽에 흩어져 있음** — `useRecognize`는 throw, 컴포넌트는 `Alert.alert` (#9 참조)

### 왜 문제인가
- 250줄을 넘는 컴포넌트는 단위 테스트 작성과 회귀 추적이 어려움
- ref 4개와 platform 분기가 섞이면 동작 흐름 추적 비용이 급격히 증가

### 개선 방향
- `MonthYearPicker`의 settle/snap 로직을 `useScrollSnap` 같은 custom hook으로 추출
- `SwipeableCalendarGrid`에서 `MonthGrid` 내부 컴포넌트를 별도 파일로 분리 검토

### 우선순위
**중간** — 현재는 동작하지만 캘린더 기능 확장 시 부담

---

## 3. 불필요한 복잡성 및 과도한 추상화

### 현재 상태 요약
- 단일 사용처 헬퍼나 base class는 거의 발견되지 않음
- UI 컴포넌트의 옵션(`variant`, `size`)은 Material Design 3 스펙에 충실하여 정당화됨
- wrapper 컴포넌트(`ScreenContainer`, `KeyboardAvoidingWrapper`)는 단일 책임 유지

### 발견된 문제점
1. **`useCalendar`의 dual-tier 캐싱**이 React Query 등 표준 라이브러리로 대체 가능한 수준의 복잡도
2. **ESLint disable 코멘트** 2건 발견
   - [useCalendar.ts:72](../src/features/recognition/hooks/useCalendar.ts) — `react-hooks/exhaustive-deps`
   - [SwipeableCalendarGrid.tsx:144](../src/features/recognition/components/SwipeableCalendarGrid.tsx) — `react-hooks/exhaustive-deps`

### 왜 문제인가
- 표준 라이브러리로 해결할 수 있는 패턴을 직접 구현하면 유지보수 부담이 커짐
- ESLint disable이 많아질수록 의존성 추적 실수 가능성 증가

### 개선 방향
- React Query/SWR 도입 검토(아래 #4와 연결)
- disable 주석에 사유를 한 줄로라도 명시

### 우선순위
**낮음** — 현재 추상화 수준은 합리적

---

## 4. 상태 관리 구조

### 현재 상태 요약
- **Zustand 사용**
  - [authStore.ts](../src/stores/authStore.ts) — user/token/refreshToken, AsyncStorage persist, hydration flag
  - [appStore.ts](../src/stores/appStore.ts) — 현재 room 컨텍스트만 보관, 미persist
- UI 상태(modal open, picker visibility)는 컴포넌트 로컬 `useState`로 관리

### 발견된 문제점
1. **서버 상태 캐싱 부재**
   - [useRoomList](../src/features/room/hooks/useRoomList.ts), [useRoom](../src/features/room/hooks/useRoom.ts), [useRecognitionFeed](../src/features/recognition/hooks/useRecognitionFeed.ts) 모두 `useFocusEffect` 시 매번 refetch
   - dedup, stale-time, retry 같은 표준 동작 없음
2. **데이터 중복 위험**
   - 같은 Room이 `useRoom`(단일)과 `useRoomList`(목록) 양쪽 메모리에 존재, 동기화 없음
3. **`useCalendar`만 자체 캐시**(cacheRef/inflightRef) — 다른 hook과 정책 불일치
4. **에러 상태가 store에 없음** — 각 hook 내부 boolean으로만 표현

### 왜 문제인가
- 화면 전환마다 동일 API 재요청 → 모바일 데이터/배터리 낭비
- 단일/목록 데이터 불일치 시 사용자에게 stale 정보 노출
- 캐싱 정책이 hook마다 달라 디버깅 시 추적 비용 큼

### 개선 방향
- **`@tanstack/react-query` 도입** 권장 → 서버 상태 일원화, dedup·refetch 정책 통일
- Zustand는 클라이언트 전용 상태(인증, UI 모드)만 담당하도록 역할 명확화

### 우선순위
**높음** — 기능이 늘어날수록 비용이 가파르게 증가

---

## 5. API 레이어 분리 및 네트워크 구조

### 현재 상태 요약
- [src/api/client.ts](../src/api/client.ts) (58줄) — fetch wrapper, Authorization 자동 주입, 401 시 refresh token 처리
- [src/api/endpoints.ts](../src/api/endpoints.ts) — endpoint 상수화
- 각 feature 내부 `api/` 폴더로 호출 함수 분리

### 발견된 문제점
1. **`apiClient` 우회 케이스**
   - [authApi.ts](../src/features/auth/api/authApi.ts) — 직접 `fetch` 호출 (apiClient 사용 안 함)
   - [recognitionApi.ts](../src/features/recognition/api/recognitionApi.ts) — 사진 업로드 부분만 직접 fetch + 인라인 인증 헤더
2. **에러 throw 형태가 단순 문자열**
   ```ts
   throw new Error(`API Error: ${response.status}`)  // client.ts:53
   ```
   호출부에서 `error.message.includes('409')` 같은 **문자열 매칭**으로 분기(아래 #9 참조)
3. **timeout / AbortController / retry 없음** — 네트워크 불안정 시 영원히 매달릴 수 있음
4. **Raw response → Domain model 매핑 부재** — API 타입과 도메인 타입이 사실상 동일

### 왜 문제인가
- apiClient 우회 시 토큰 만료/리프레시 흐름이 우회 코드에서 누락됨
- 문자열 기반 에러 분기는 백엔드 메시지 변경 시 조용히 깨짐
- timeout 부재는 RN 환경에서 ANR 유사 증상 유발

### 개선 방향
- **모든 API 호출을 `apiClient` 단일 채널로 강제** (FormData 분기 포함)
- 커스텀 `ApiError` 클래스 도입(status code, error code, raw payload 보유)
- `client.ts`에 timeout/AbortController 기본 적용
- 401 외 5xx에 대한 retry-with-backoff 정책 추가

### 우선순위
**높음** — 운영 안정성과 직결

---

## 6. 타입 정의 품질

### 현재 상태 요약
- `tsconfig.json`에 `strict: true` 활성화, 경로 alias `@/*` 정상 작동
- feature 별 `types/` 폴더에 도메인 타입 정의 (Auth, Room, Recognition)
- Navigation params는 `useLocalSearchParams<{ id: string }>()` 형태로 적절히 타입 지정

### 발견된 문제점
1. **`as any` 13건 발견**
   - 라우터 push/replace의 template literal href 캐스팅 8건
     ```ts
     router.push(`/room/${room.id}` as any)
     ```
   - `formData.append('photo', {...} as any)` ([recognitionApi.ts](../src/features/recognition/api/recognitionApi.ts))
   - `catch (error: any)` 3건
   - JSX style cast 1건 ([RecognitionCard.tsx:36](../src/features/recognition/components/RecognitionCard.tsx))
2. **API raw response와 도메인 모델이 미분리** — 백엔드 변경이 곧바로 UI까지 전파
3. **사용되지 않는 타입 파일** — [common.types.ts](../src/types/common.types.ts)

### 왜 문제인가
- `as any`는 TS strict 모드의 보호를 무력화 → 런타임 오류 가능성
- raw/domain 분리 부재는 백엔드와 강결합을 만들어 변경 비용을 키움

### 개선 방향
- **타입 안전 라우트 빌더** 작성 (`routes.roomDetail(id)` → `Href` 반환)
- `catch (error: unknown)` + 타입 가드 패턴으로 전환
- API 응답 타입 → 도메인 타입 mapper 함수 도입(특히 Recognition, Room)

### 우선순위
**중간** — strict 모드의 가치를 희석시키는 패턴 제거 필요

---

## 7. 디자인 시스템 및 스타일 관리

### 현재 상태 요약
- [design/tokens/](../design/tokens/) 에 colors/elevation/motion/shape/spacing/typography 6종 토큰 정의
- [ThemeProvider](../design/theme/ThemeProvider.tsx) — light/dark/system 모드 지원, AsyncStorage 영속화
- UI 컴포넌트 11종이 Material Design 3 스펙에 맞게 구현, barrel export로 재사용

### 발견된 문제점
1. **하드코딩 색상**
   - `rgba(0,0,0,0.6)` — [RecognitionCard.tsx:44](../src/features/recognition/components/RecognitionCard.tsx)
   - `#FFFFFF` — [RecognitionCard.tsx:46](../src/features/recognition/components/RecognitionCard.tsx)
2. **매직 넘버 사이징**
   - Avatar 32×32, 캘린더 셀 56px 등 spacing 토큰 미사용
3. **다크 모드 검증 부족** — 토큰은 정의되어 있으나 실제 dark scheme 동작 확인 사례가 코드 내 없음

### 왜 문제인가
- 토큰을 우회하면 디자인 변경 시 grep 기반 수정이 필요해져 누락 위험
- 다크 모드는 정의만 있고 검증 안 된 채 출시되면 사용자 신뢰 하락

### 개선 방향
- `colors.scrim`, `colors.onPrimary` 등 토큰으로 교체
- spacing/sizing 매직 넘버를 `spacing.xs/sm/md/lg` 또는 `shape.full` 토큰으로 치환
- 다크 모드 시각 회귀 점검을 PR 체크리스트에 추가

### 우선순위
**낮음** — 기반은 견고, 누수만 막으면 됨

---

## 8. 네비게이션 구조 및 라우팅 안정성

### 현재 상태 요약
- Expo Router 기반 그룹 라우팅 (`(auth)`, `(main)`, `room/[id]/`)
- 라우팅 파일은 thin wrapper로 도메인 코드와 분리
- route param은 generic으로 타입 지정

### 발견된 문제점
1. **인증 가드 부재**
   - `app/_layout.tsx` 또는 `(main)/_layout.tsx`에 `isLoggedIn` 검사 redirect 없음
   - 각 화면에서 useEffect로 사후 검사 → 깜빡임/우회 가능
2. **라우트 href가 `as any`**로 type-unsafe (#6 중복)
3. **딥링크 설정 없음** — `app.json`의 scheme/intentFilter 미정의 (확인 필요)
4. **`router.back()` 호출 시 `canGoBack()` 미검증** ([CreateRoomForm.tsx:44](../src/features/room/components/CreateRoomForm.tsx) 등)

### 왜 문제인가
- 가드 부재는 보안 이슈는 아니지만 UX 측면에서 로그아웃 후 스택 잔존 화면 노출 위험
- `canGoBack` 미검증은 외부 진입(딥링크/푸시) 시 화면 멈춤 유발

### 개선 방향
- `(main)/_layout.tsx`에서 `useAuthStore` 구독 후 `<Redirect href="/(auth)/login" />`
- 라우트 상수 파일(`routes.ts`)과 타입 안전 빌더 도입
- `if (router.canGoBack()) router.back(); else router.replace('/')` 패턴 표준화

### 우선순위
**높음** — 인증 가드는 기본 안정성 항목

---

## 9. 비동기 처리 및 에러 핸들링

### 현재 상태 요약
- `loading`/`error`/`empty` 상태가 컴포넌트 단위로 관리됨 (FlatList + EmptyFeed 등)
- 더블탭 방지: `disabled={isLoading}` 일관 적용
- [useCalendar](../src/features/recognition/hooks/useCalendar.ts)에 `cancelled` cleanup flag로 unmount 후 setState 방지

### 발견된 문제점
1. **에러 처리 패턴이 3가지 혼재**
   - hook 내부: `console.error` + 무시
   - LoginScreen/PhotoUploadScreen: `Alert.alert` 일반 메시지
   - useRecognize: `error.message.includes('409')` **문자열 매칭** 분기
2. **AbortController 미사용** — 화면 빠른 전환 시 stale fetch가 store/state에 반영될 수 있음
3. **에러 시 사용자 피드백 부재 케이스** — 다수 hook이 `console.error`만 호출하고 화면은 stale/empty 상태 유지

### 왜 문제인가
- 백엔드 응답 포맷 변경 시 문자열 매칭 분기가 조용히 깨짐
- 에러 무시는 사용자가 "왜 안 되지?" 상태에 빠지게 만듦

### 개선 방향
- `ApiError` 클래스 도입 후 `error.code === 'ALREADY_RECOGNIZED'` 형태로 분기
- `useToast` 등 공용 피드백 채널을 만들어 hook → UI 알림 표준화
- `apiClient`에 AbortController 옵션 추가 후 hook에서 cleanup 시 abort

### 우선순위
**높음** — 문자열 매칭 분기는 운영 중 잠재 버그

---

## 10. 성능 관점의 구조적 문제

### 현재 상태 요약
- 리스트는 모두 `FlatList` + `keyExtractor: item.id` 적용
- `useMemo`/`useCallback` 약 20+/15+ 건, 대부분 필요한 위치에 사용
- `useAuthStore`는 selector 기반 구독(`useAuthStore((s) => s.user)`)
- 이미지: `expo-image` 사용 (캐싱·최적화 자동)

### 발견된 문제점
1. **이미지 placeholder/blurhash 미설정** — 네트워크 느릴 때 빈 영역
2. **일부 과한 memoization** — `Button.tsx`의 `sizeStyle`/`variantStyle` `useMemo`는 의존성이 매번 변하면 효과 없음
3. **`useFocusEffect` + refetch 조합**이 화면 전환 시 매번 발화 (#4와 연결, 캐싱 부재로 누적 비용 발생)

### 왜 문제인가
- placeholder 부재는 체감 성능 저하
- 불필요한 memoization은 가독성을 해치는 데 비해 이득 없음

### 개선 방향
- `expo-image`의 `placeholder` prop으로 blurhash/색 fallback 적용
- React Query로 캐싱 적용 시 자동으로 refetch 비용 감소
- 단순 inline 객체는 memoization 제거 검토

### 우선순위
**낮음** — 현재 규모에서는 체감 이슈 미미

---

## 11. 플랫폼 대응 및 네이티브 의존성 관리

### 현재 상태 요약
- `Platform.OS` 분기 4곳: dev API URL, KeyboardAvoiding behavior, FormData 업로드, ScrollView settle
- `react-native-safe-area-context` 적절히 사용 (BottomSheet, ScreenContainer)
- `src/utils/platform.ts`에 `isIOS`, `isAndroid` 헬퍼 존재 — **단, 코드베이스에서 미사용**

### 발견된 문제점
1. **카메라/사진 권한 처리 부재**
   - `expo-image-picker` 설치되어 있으나 [useImagePicker.ts](../src/hooks/useImagePicker.ts)는 **TODO 스텁**
   - iOS Info.plist / Android manifest 권한 메시지 확인 필요
2. **`platform.ts` 헬퍼 미사용** — 직접 `Platform.OS === 'ios'` 비교 반복

### 왜 문제인가
- 권한 미처리 → 실 단말에서 업로드 시도 시 크래시 또는 무반응
- 헬퍼가 있는데 안 쓰면 dead code 양산

### 개선 방향
- `useImagePicker`를 실제 구현 (request permission → launchImageLibrary → 결과 반환)
- `app.json`의 `ios.infoPlist`, `android.permissions`에 카메라/사진 항목 추가
- 직접 `Platform.OS` 비교를 `isIOS`/`isAndroid`로 통일

### 우선순위
**높음** — 핵심 기능(사진 업로드) 동작에 필수

---

## 12. 테스트 가능성 및 회귀 방지 구조

### 현재 상태 요약
- **테스트 파일/설정 일체 없음** (jest config, `__tests__/`, `*.test.ts` 미존재)
- 다만 hook/api/store 분리가 잘 되어 있어 **테스트 친화적 구조**

### 발견된 문제점
1. 핵심 비즈니스 로직(추천/투표 결과, 캘린더 prefetch)이 테스트되지 않음
2. validation/formatter (`utils/format.ts`)도 단위 테스트 부재
3. CI 파이프라인에서 회귀 검증 불가

### 왜 문제인가
- 향후 React Query 도입 등 대규모 리팩토링 시 회귀 위험 큼

### 개선 방향
- Jest + `@testing-library/react-native` 세팅
- 우선순위: ① `format.ts` ② `useCalendar` 캐시 동작 ③ `apiClient` 토큰 리프레시
- 컴포넌트 단위 snapshot 대신 상호작용 테스트 위주

### 우선순위
**중간** — 즉시 위험은 아니나 안정성 확보 차원

---

## 13. 접근성 및 UX 일관성

### 현재 상태 요약
- `accessibilityRole="button"` 4곳 (Button, IconButton, BottomSheet 닫기)
- BottomSheet에 `accessibilityLabel="닫기"` 명시
- 터치 영역: Button min-height 40px (적정)

### 발견된 문제점
1. **대부분의 인터랙션 요소에 `accessibilityLabel` 없음** — RoomCard, Avatar, 메뉴 항목 등
2. **`accessibilityHint` 부재** — 스와이프 캘린더 같은 비표준 제스처에 대한 안내 없음
3. **로딩/에러/빈 상태 UX 비일관** — Alert vs 화면 내 메시지가 화면마다 다름
4. **폰트 크기 동적 대응 미점검** — iOS Dynamic Type / Android font scale 영향 검증 부재

### 왜 문제인가
- 스크린리더 사용자에게 사실상 미지원
- UX 비일관성은 사용자 학습 비용을 키움

### 개선 방향
- `Button`/`IconButton`/`Card`의 인터랙티브 props에 `accessibilityLabel` 필수화 (TS optional → required)
- 공용 `Toast`/`InlineError` 컴포넌트로 피드백 채널 통일
- WCAG AA 색상 대비 한 차례 검증

### 우선순위
**중간** — 출시 전 한 번은 정리 필요

---

## 14. 환경설정, 상수, 보안성

### 현재 상태 요약
- [src/constants/config.ts](../src/constants/config.ts):
  ```ts
  API_URL: __DEV__ ? DEV_API_URL : 'https://api.example.com'
  ```
- [authStore](../src/stores/authStore.ts) — AsyncStorage `createJSONStorage`로 토큰 영속화
- ESLint: `eslint-config-expo/flat` 기본
- TS: `strict: true`

### 발견된 문제점 — **본 보고서 최대 위험 영역**
1. **🔴 운영 API URL이 placeholder** (`https://api.example.com`) — 그대로 빌드 시 무용지물
2. **🔴 토큰을 평문 AsyncStorage에 저장** — 탈취 위험. RN에서는 `expo-secure-store`/Keychain 사용해야 함
3. **🔴 `.env` 파일 / EAS secret 설정 부재** — OAuth client ID, API URL 등 환경 분리 메커니즘 없음
4. dev/stage/prod 구분 메커니즘 부재 (현재는 `__DEV__` 단일 분기)

### 왜 문제인가
- 운영 빌드 후 동작 불가
- 토큰 평문 저장은 OWASP Mobile Top 10의 M2(Insecure Data Storage)에 직접 해당
- 환경 분리 부재는 staging QA 자체가 불가

### 개선 방향
- [ ] `expo-constants` + `app.config.ts` + EAS secret으로 `API_URL`, OAuth ID 주입
- [ ] `expo-secure-store`로 access/refresh token 이전, AsyncStorage에는 비민감 정보만
- [ ] `.env.example` 작성 + `.gitignore` 점검
- [ ] dev/staging/prod별 `app.config.ts` 분기

### 우선순위
**높음 (즉시)** — 출시 전 반드시 해결

---

## 15. 네이밍, import 규칙, 팀 일관성

### 현재 상태 요약
- 컴포넌트 PascalCase, hook/api camelCase, 라우팅 파일 kebab-case — **100% 일관**
- 모든 import가 `@/src/...`, `@/design/...` 별칭 사용 (relative import 사실상 0)
- UI 컴포넌트는 barrel export(`src/components/ui/index.ts`)로 통일

### 발견된 문제점
1. **feature 단위 barrel export 부재** — import path가 길고 변경 비용 큼
2. **ESLint 룰 보강 여지** — accessibility, import ordering, naming-convention 등 rule 미설정
3. **ESLint disable 사유 미기재** (#3 중복)

### 왜 문제인가
- ESLint 보강 부재는 코드 리뷰에서 일관성 강제력이 떨어짐을 의미

### 개선 방향
- `eslint-plugin-react-native-a11y`, `eslint-plugin-import`(order), `@typescript-eslint`(naming-convention) 단계적 도입
- 각 feature에 `index.ts` barrel 추가

### 우선순위
**낮음** — 일관성은 이미 우수, 추가 개선 차원

---

## 종합 평가

### A. 잘 유지되고 있는 영역 (유지)
- ✅ feature-based 폴더 구조와 관심사 분리
- ✅ Material Design 3 토큰 시스템과 ThemeProvider
- ✅ 경로 alias 일관성, 파일/심볼 네이밍 규칙
- ✅ 기본적인 UI 컴포넌트 라이브러리 완성도
- ✅ FlatList/메모이제이션 등 기본 성능 패턴
- ✅ Zustand 기반 인증 store 단순성

### B. 개선이 필요한 영역 (1~2 스프린트 내 정리)
- ⚠️ 서버 상태 캐싱 부재(React Query 도입 검토)
- ⚠️ apiClient 일원화(인증/업로드 우회 제거)
- ⚠️ 에러 처리 표준화(`ApiError` + 공용 Toast)
- ⚠️ 타입 안전 라우트 빌더(`as any` 제거)
- ⚠️ MonthYearPicker/SwipeableCalendarGrid 복잡도 정리
- ⚠️ 접근성 라벨 보강
- ⚠️ Jest 도입 및 핵심 유틸/훅 테스트
- ⚠️ Dead code 정리(`storage.ts`, `middleware.ts`, `common.types.ts`)

### C. 즉시 정리해야 할 영역 (출시 전 필수)
- 🔴 **운영 API URL placeholder** — `https://api.example.com` 그대로 빌드 시 동작 불가
- 🔴 **토큰 평문 저장** — `expo-secure-store` 또는 Keychain으로 이전
- 🔴 **환경 변수 / EAS secret 설정** — `.env`, `app.config.ts` 도입
- 🔴 **이미지 피커 미구현** — [useImagePicker.ts](../src/hooks/useImagePicker.ts) TODO 상태, 사진 업로드 기능의 사실상 미완성
- 🔴 **카메라/사진 권한 처리 부재** — 실 단말에서 크래시 가능
- 🔴 **인증 라우트 가드 부재** — `(main)/_layout.tsx`에서 redirect 패턴 적용

---

## 우선순위별 액션 아이템 요약

| 순위 | 항목 | 영향 | 작업량 |
|------|------|------|--------|
| 🔴 즉시 | 운영 API URL/환경 변수 정리 | 출시 차단 | 소 |
| 🔴 즉시 | 토큰 SecureStore 이전 | 보안 | 중 |
| 🔴 즉시 | `useImagePicker` 실제 구현 + 권한 | 핵심 기능 | 중 |
| 🔴 즉시 | 인증 라우트 가드 | UX/보안 | 소 |
| 🟠 단기 | React Query 도입 | 확장성 | 대 |
| 🟠 단기 | `ApiError` + 공용 에러 채널 | 운영 안정성 | 중 |
| 🟠 단기 | 타입 안전 라우트 빌더 | 안정성 | 소 |
| 🟠 단기 | apiClient 우회 제거 | 일관성 | 소 |
| 🟡 중기 | MonthYearPicker 리팩토링 | 유지보수 | 중 |
| 🟡 중기 | 접근성 라벨 보강 | UX | 중 |
| 🟡 중기 | Jest 세팅 + 핵심 단위 테스트 | 회귀 방지 | 중 |
| 🟢 장기 | feature barrel export, ESLint 룰 강화 | 일관성 | 소 |
| 🟢 장기 | 다크 모드 시각 회귀 점검 | 품질 | 소 |
| 🟢 장기 | Dead code 정리 | 청결도 | 소 |

---

> 본 보고서는 정적 분석에 기반한 점검 결과이며, 실 단말 동작 검증과 사용성 테스트는 별도로 수행되어야 한다.
