# 메인 화면 네비게이션 리디자인 기획서

> **버전**: 1.0
> **작성일**: 2026-04-18
> **대상 화면**: `app/(main)/index.tsx` → `src/features/room/components/RoomListScreen.tsx`
> **핵심 원칙**: 기존 디자인 시스템(M3 토큰, `BottomSheet`/`DropdownMenu` 등) 재사용 / 신규 의존성 추가 금지 / 컴포넌트 단위 분리

---

## 1. 변경 개요 (한눈에 보기)

| 영역 | 현재 (AS-IS) | 변경 (TO-BE) |
|---|---|---|
| 우측 상단 아이콘 | `dots-vertical` (...) → DropdownMenu (프로필/설정/로그아웃) | `plus` (+) → DropdownMenu (방 만들기 / 방 참가하기) |
| 좌측 상단 아바타 | 탭 시 "준비 중" Alert | 탭 시 **좌측 드로어** 슬라이드 인 (프로필 + 로그아웃) |
| 화면 우→좌 스와이프 | 동작 없음 | 좌측 드로어 열기 (X 앱과 동일) |
| 하단 "초대코드로 참가" 버튼 | 항상 표시 | **삭제** |
| 방 목록이 비었을 때 | 빈 상태 텍스트만 표시 | **원형 큰 버튼 2개** ("참가" / "생성") 표시 |
| "방 만들기" 화면 | 풀스크린 라우트 (`/(main)/create-room`) | **BottomSheet 모달** |
| "초대코드로 참가" 화면 | 풀스크린 라우트 (`/room/join`) | **BottomSheet 모달** |
| 모달 닫기 인터랙션 | (해당 없음) | ① 좌측 상단 "취소" 텍스트 ② 아래로 스와이프 ③ 스크림 탭 |

---

## 2. 컴포넌트 영향 매트릭스

| 파일 경로 | 작업 | 비고 |
|---|---|---|
| `src/features/room/components/RoomListScreen.tsx` | **수정** | App bar / 빈상태 / 모달 상태 관리 |
| `src/features/room/components/CreateRoomForm.tsx` | **리팩터** | 모달용 컨텐트 컴포넌트로 분리 (ScreenContainer 제거) |
| `src/features/room/components/JoinRoomForm.tsx` | **리팩터** | 동일 (모달용으로 변경) |
| `app/(main)/create-room.tsx` | **삭제** | 라우트 제거 (모달로 대체) |
| `app/room/join.tsx` | **삭제** | 동일 |
| `app/(main)/_layout.tsx` | **수정** | `create-room` Stack.Screen 제거 |
| `app/room/_layout.tsx` | **수정** | `join` Stack.Screen 제거 |
| `src/components/ui/BottomSheet.tsx` | **확장** | 드래그-다운으로 닫기 제스처 추가 (현재 미지원) |
| `src/components/ui/index.ts` | **수정** | 신규 컴포넌트 export 추가 |
| `src/features/main/components/ProfileDrawer.tsx` | **신규** | 좌측 슬라이딩 드로어 (X 스타일) |
| `src/features/main/components/CreateRoomSheet.tsx` | **신규** | BottomSheet + CreateRoomForm 래퍼 |
| `src/features/main/components/JoinRoomSheet.tsx` | **신규** | BottomSheet + JoinRoomForm 래퍼 |
| `src/features/main/components/EmptyRoomActions.tsx` | **신규** | 원형 버튼 2개 (참가/생성) 빈 상태 |

> **신규 폴더**: `src/features/main/components/` — 메인 화면 전용 UI를 모음. `room` 도메인 로직과 분리하여 결합도를 낮춤.

---

## 3. 상세 설계

### 3.1 RoomListScreen 리팩터링

```tsx
// 핵심 상태
const [drawerOpen, setDrawerOpen] = useState(false);
const [addMenuOpen, setAddMenuOpen] = useState(false);
const [createSheetOpen, setCreateSheetOpen] = useState(false);
const [joinSheetOpen, setJoinSheetOpen] = useState(false);

// + 메뉴 항목
const addMenuItems: DropdownMenuItem[] = [
  { label: '방 만들기', icon: 'home-plus-outline', onPress: () => setCreateSheetOpen(true) },
  { label: '방 참가하기', icon: 'ticket-confirmation-outline', onPress: () => setJoinSheetOpen(true) },
];
```

#### App Bar 변경
- 좌측 `Avatar` → `onPress={() => setDrawerOpen(true)}`
- 중앙 `recognizer` 타이틀 (유지)
- 우측 `IconButton icon="plus"` → `onPress={() => setAddMenuOpen(true)}`
- 기존 `dots-vertical` 메뉴 (프로필/설정/로그아웃) **제거** — 드로어로 이전

#### 본문 분기
```tsx
{rooms.length === 0
  ? <EmptyRoomActions onJoin={() => setJoinSheetOpen(true)} onCreate={() => setCreateSheetOpen(true)} />
  : <FlatList ... />}
```

- **방 목록이 있을 때**: 기존 FlatList 유지하되, **`ListHeaderComponent`의 "+ 새 방 만들기" 카드를 제거** (+ 버튼 메뉴로 통합).
- **하단 "초대코드로 참가" 버튼 영역 전체 삭제**.

#### 화면 우→좌 스와이프로 드로어 열기
- `react-native-gesture-handler`의 `PanGestureHandler`를 `RoomListScreen` 최상위에 래핑.
- 임계값: `translationX > 60 && velocityX > 300` → `setDrawerOpen(true)`.
- (중복 의존성 없음: `react-native-gesture-handler`는 이미 `BottomSheet`에서 사용 중)

---

### 3.2 ProfileDrawer (신규, 좌측 슬라이드)

**위치**: `src/features/main/components/ProfileDrawer.tsx`

```tsx
type ProfileDrawerProps = {
  visible: boolean;
  onClose: () => void;
};
```

#### 레이아웃 (위→아래)
```
┌────────────────────────────────┐
│  [Avatar 56]                    │  ← 상단 24px 패딩 + safe area
│                                 │
│  닉네임 (titleMedium, 700)      │
│  @userId (bodySmall, onSurfaceVariant) │
├────────────────────────────────┤
│                                 │
│  [logout 아이콘]  로그아웃     │  ← Pressable 행, 높이 56
│                                 │
│  …(향후 메뉴 항목 추가 영역)   │
│                                 │
└────────────────────────────────┘
        ↑ 화면 너비의 80% (max 320px)
```

#### 동작
- **열림**: `visible=true` → 좌측에서 우측으로 슬라이드 인 (`translateX: -width → 0`), 스크림 페이드 인.
- **닫힘**: 스크림 탭 / 좌→우 스와이프(50px 이상 이동) / `onClose` 호출.
- **모션**: `BottomSheet`와 동일하게 `motion.spatialDefault` (spring) + `duration.medium2` (스크림).
- **z-index**: 화면 전체를 덮는 `Modal`로 구현 (BottomSheet와 동일 패턴).

#### 스타일
- 배경: `colors.surfaceContainerHigh`
- 우측 모서리: `borderTopRightRadius: shape.large`, `borderBottomRightRadius: shape.large`
- 그림자: `elevation(2)`
- 너비: `Math.min(Dimensions.get('window').width * 0.8, 320)`
- `useSafeAreaInsets`로 상단/하단 여백 보정

#### 메뉴 항목 (확장 가능 패턴)
```tsx
type DrawerItem = {
  icon: MaterialIconName;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

const items: DrawerItem[] = [
  { icon: 'logout', label: '로그아웃', onPress: logout, destructive: true },
];
```
> 추후 `프로필`, `설정`, `테마` 등을 이 배열에 push만 하면 됨.

---

### 3.3 BottomSheet 확장 (드래그-다운 닫기)

**현재 한계**: `BottomSheet.tsx`에 드래그 제스처가 없음. 사용자 요구사항 충족을 위해 추가 필요.

#### 변경 사항 (`src/components/ui/BottomSheet.tsx`)
```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const dragGesture = Gesture.Pan()
  .onUpdate((e) => {
    if (e.translationY > 0) translateY.value = e.translationY;
  })
  .onEnd((e) => {
    if (e.translationY > 120 || e.velocityY > 800) {
      runOnJS(onClose)();
    } else {
      translateY.value = withSpring(0, motion.spatialDefault);
    }
  });

// 드래그 핸들 영역만 GestureDetector로 감쌈 (스크롤 충돌 방지)
<GestureDetector gesture={dragGesture}>
  <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
    <View style={{ width: 32, height: 4, ... }} />
  </View>
</GestureDetector>
```

> **주의**: 시트 내부에 ScrollView/FlatList가 들어갈 경우를 대비해 **드래그는 핸들 영역에만 적용**한다. 컨텐트 전체 영역 드래그는 키보드/입력 충돌 위험.

#### Props 추가 (선택)
```tsx
type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** 좌측 상단 "취소" 헤더 표시 여부 (기본 false). title과 함께 사용 */
  showCancelHeader?: boolean;
  title?: string;
};
```

`showCancelHeader`가 true이면 시트 상단(드래그 핸들 아래)에 다음 헤더를 렌더:
```
┌─────────────────────────────────────┐
│  취소           제목           (빈)  │  ← 56px
└─────────────────────────────────────┘
```
- "취소": `Pressable` + `Text variant="bodyLarge" color={colors.onSurface}` → `onClose()` 호출
- 제목: `Text variant="titleMedium"` 중앙 정렬

---

### 3.4 CreateRoomSheet / JoinRoomSheet (신규)

**목적**: 기존 풀스크린 폼을 BottomSheet 콘텐트로 래핑.

#### `CreateRoomSheet.tsx`
```tsx
type Props = {
  visible: boolean;
  onClose: () => void;
};

export function CreateRoomSheet({ visible, onClose }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} showCancelHeader title="방 만들기">
      <CreateRoomFormContent onSuccess={onClose} />
    </BottomSheet>
  );
}
```

#### `CreateRoomFormContent` (CreateRoomForm 분리)
- 기존 `CreateRoomForm`에서 `ScreenContainer`, `KeyboardAvoidingWrapper`, App bar 제거.
- 핵심 컨텐트(Input + Button)만 남김.
- `onSuccess` prop 추가: 방 생성 성공 시 `onSuccess()` 호출 후 `router.push(/room/${id})`.

```tsx
export function CreateRoomFormContent({ onSuccess }: { onSuccess: () => void }) {
  // ... 기존 로직 유지, router.dismiss() → onSuccess() 로 교체
  // 외곽 컨테이너만 변경
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}>
      <Input ... autoFocus />
      <View style={{ marginTop: 24 }}>
        <Button title="만들기" ... />
      </View>
    </View>
  );
}
```

> **호환성 유지**: 기존 `CreateRoomForm` (라우트용 풀스크린)은 **삭제**한다. `app/(main)/create-room.tsx` 라우트도 함께 삭제 (정합성). 만약 외부에서 직접 라우트 호출하던 코드가 있다면 grep 으로 잡고 모달 호출로 변경.

#### `JoinRoomSheet.tsx` / `JoinRoomFormContent`
- CreateRoom과 동일한 패턴으로 구현.
- 성공 시 `onSuccess()` → 부모가 시트 닫고 → `router.push(/room/${id})`.

---

### 3.5 EmptyRoomActions (신규, 빈 상태 UI)

**위치**: `src/features/main/components/EmptyRoomActions.tsx`

```tsx
type Props = {
  onJoin: () => void;
  onCreate: () => void;
};
```

#### 레이아웃
```
        (수직/수평 중앙 정렬)
   ┌────────────┐    ┌────────────┐
   │            │    │            │
   │   🎟️       │    │   ➕        │   ← 96×96 원형
   │            │    │            │
   └────────────┘    └────────────┘
       참가              생성        ← labelLarge, marginTop 12
```

#### 스타일
- 컨테이너: `flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 32`
- 원형 버튼: `width: 96, height: 96, borderRadius: 48`
  - `참가`: `backgroundColor: colors.secondaryContainer`, 아이콘 색 `colors.onSecondaryContainer`, 아이콘 `ticket-confirmation-outline`
  - `생성`: `backgroundColor: colors.primaryContainer`, 아이콘 색 `colors.onPrimaryContainer`, 아이콘 `home-plus-outline`
- `Pressable + cssInterop={false}` (NativeWind 버그 회피, 기존 패턴 준수)
- `pressed` 시 `opacity: 0.85` 적용
- 아이콘 크기: 40
- 라벨: `Text variant="labelLarge"` 중앙 정렬

#### 보조 텍스트 (선택, 상단)
```tsx
<View style={{ alignItems: 'center', marginBottom: 32 }}>
  <Text variant="titleMedium">아직 참여한 방이 없어요</Text>
  <Text variant="bodySmall" color={colors.onSurfaceVariant} style={{ marginTop: 4 }}>
    방을 만들거나 초대코드로 참가해보세요
  </Text>
</View>
```

---

## 4. 인터랙션 플로우

### 4.1 + 버튼 → 방 만들기/참가
```
[+ 탭] → DropdownMenu 표시 (anchor: top:72, right:20)
    ├─ "방 만들기" 탭 → setCreateSheetOpen(true)
    │     → BottomSheet 슬라이드 업
    │     → 입력 후 "만들기" → API 호출 → onSuccess() → 시트 닫기 → /room/{id} 이동
    └─ "방 참가하기" 탭 → setJoinSheetOpen(true)
          → BottomSheet 슬라이드 업
          → 코드 입력 후 "참가하기" → API 호출 → onSuccess() → 시트 닫기 → /room/{id} 이동
```

### 4.2 BottomSheet 닫기 (3가지 방식)
| 방식 | 트리거 |
|---|---|
| 좌측 상단 "취소" 탭 | `showCancelHeader` 헤더 |
| 아래로 드래그 | 핸들 영역 PanGesture (translationY > 120 또는 velocity > 800) |
| 스크림 탭 | 기존 동작 |

### 4.3 ProfileDrawer 열기/닫기
```
[Avatar 탭]            → setDrawerOpen(true)
[화면 좌→우 스와이프]  → 동일
[스크림 탭]            → setDrawerOpen(false)
[드로어 우→좌 스와이프]→ 동일
```

### 4.4 빈 상태 (방 0개)
```
[참가 원형 버튼] → setJoinSheetOpen(true) → 동일 시트
[생성 원형 버튼] → setCreateSheetOpen(true) → 동일 시트
```

---

## 5. 디자인 토큰 사용 가이드 (재확인)

모든 색상은 `useTheme()`의 `colors`에서 가져온다. 인라인 hex 사용 금지.

| 용도 | 토큰 |
|---|---|
| 드로어/시트 배경 | `colors.surfaceContainerHigh` |
| 스크림 | `colors.scrim` (opacity 0.32) |
| 원형 버튼 (생성) | `colors.primaryContainer` / `colors.onPrimaryContainer` |
| 원형 버튼 (참가) | `colors.secondaryContainer` / `colors.onSecondaryContainer` |
| 로그아웃 텍스트 | `colors.error` (destructive) |
| 시트 모서리 | `shape.extraLarge` (28dp) |
| 드로어 모서리 | `shape.large` (16dp) |
| 모션 (열기) | `motion.spatialDefault` (spring) |
| 모션 (닫기) | `motion.spatialFast` |
| 스크림 페이드 | `duration.medium2` (300ms) |

---

## 6. 구현 순서 (작업 단위)

> 각 단계 완료 후 Android 에뮬레이터에서 동작 확인.

1. **BottomSheet 확장** — 드래그-다운 + `showCancelHeader`/`title` props 추가
2. **CreateRoomForm 분리** — `CreateRoomFormContent` 추출, 기존 폼 제거
3. **JoinRoomForm 분리** — `JoinRoomFormContent` 추출, 기존 폼 제거
4. **CreateRoomSheet / JoinRoomSheet** — 신규 작성
5. **라우트 정리** — `app/(main)/create-room.tsx`, `app/room/join.tsx` 및 Stack.Screen 제거
6. **ProfileDrawer** — 신규 작성 (좌측 슬라이드 + PanGesture)
7. **EmptyRoomActions** — 신규 작성
8. **RoomListScreen 통합** — App bar 변경, 모달/드로어 상태 연결, 빈 상태 분기, PanGesture 추가, 하단 버튼 제거
9. **회귀 테스트** — Android/iOS/Web 3개 플랫폼에서 모든 인터랙션 점검

---

## 7. 비-목표 (이번 작업에서 하지 않는 것)

- 다국어/i18n 도입
- 드로어 내 "프로필", "설정" 등 신규 메뉴 추가 (자리만 마련, 기능 미구현)
- 방 목록 정렬/필터/검색 기능
- 푸시 알림, 딥링크 변경
- BottomSheet snap point (다중 높이) — 단일 높이만 지원
- 드로어 내 다크모드 토글 등 세팅 항목

---

## 8. 검증 체크리스트 (개발 완료 시)

- [ ] + 버튼 탭 시 드롭다운에 "방 만들기" / "방 참가하기" 표시
- [ ] 두 항목 모두 BottomSheet 모달로 열림
- [ ] 시트의 "취소", 드래그-다운, 스크림 탭 → 모두 닫힘
- [ ] 방 생성/참가 성공 시 시트 자동 닫힘 + `/room/{id}` 이동
- [ ] Avatar 탭 시 좌측 드로어 슬라이드 인
- [ ] 화면 좌→우 스와이프로 드로어 열림
- [ ] 드로어의 로그아웃 정상 동작
- [ ] 방 0개일 때 원형 버튼 2개(참가/생성) 표시
- [ ] 방 1개 이상일 때 FlatList 표시 (하단 "초대코드로 참가" 버튼 없음)
- [ ] 기존 `/(main)/create-room`, `/room/join` 경로 호출이 코드 어디에도 없음 (grep 확인)
- [ ] Android/iOS/Web 3개 플랫폼에서 동일하게 동작
- [ ] 키보드가 시트 입력창을 가리지 않음 (KeyboardAvoidingView 처리)

---

## 9. 알려진 리스크 및 대응

| 리스크 | 대응 |
|---|---|
| BottomSheet 내부 키보드 가림 | `Modal`의 `avoidKeyboard` 또는 시트 내 `KeyboardAvoidingView` 추가. `behavior="padding"` (iOS) / `"height"` (Android). |
| 좌측 드로어 PanGesture가 FlatList 스크롤과 충돌 | `Gesture.Pan().activeOffsetX([-15, 15])`로 수평 임계값 설정. 수직 스크롤은 통과시킴. |
| Web 환경에서 PanGestureHandler 동작 | `react-native-gesture-handler`는 web 지원. 단, 마우스 드래그 동작 상이 → 데스크톱은 스크림 탭으로 닫기 우선. |
| 기존 라우트 삭제로 인한 깨진 링크 | 변경 전 `grep "create-room\\|/room/join"`로 호출부 전수 조사. |
| NativeWind cssInterop 버그 (function-style) | 모든 신규 `Pressable`에 `cssInterop={false}` 명시 (기존 패턴 준수). |

---

## 10. 참고 파일 (기존 자산)

- `src/components/ui/BottomSheet.tsx` — 시트 베이스 (확장 대상)
- `src/components/ui/DropdownMenu.tsx` — + 버튼 메뉴에 그대로 사용
- `src/components/ui/IconButton.tsx` — App bar 아이콘
- `src/components/ui/Avatar.tsx` — 좌측 상단 + 드로어 헤더에서 재사용
- `design/theme/ThemeProvider.tsx` — 모든 색상/모션 토큰
- `note/CROSS_PLATFORM_STYLING_GUIDE.md` — Pressable cssInterop={false} 규칙

---

**End of Document**
