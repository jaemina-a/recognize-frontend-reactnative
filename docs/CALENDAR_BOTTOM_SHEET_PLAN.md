# 캘린더 바텀시트 전환 기획서

## 1. 개요

캘린더 아이콘을 누르면 별도 페이지(`/room/[id]/calendar`)로 이동하는 현재 방식을, **바텀시트(Bottom Sheet)** 형태로 변경한다. 캘린더 아이콘 클릭 시 화면 하단에서 부드럽게 올라오는 모달 시트에 캘린더를 표시하고, 뒷 배경은 scrim(반투명 어두운 오버레이)으로 처리한다.

Material Design 3의 **Date Picker — Modal** 스펙을 참고한다.

---

## 2. 현재 구조 (AS-IS)

```
[RoomHeader] 캘린더 아이콘 클릭
  → router.push(`/room/${roomId}/calendar`)
    → app/room/[id]/calendar.tsx (전체 페이지)
      → <CalendarView /> 컴포넌트 렌더링
```

### 관련 파일

| 파일 | 역할 |
|---|---|
| `src/features/room/components/RoomHeader.tsx` | 캘린더 아이콘 버튼, `router.push` 로 페이지 이동 |
| `app/room/[id]/calendar.tsx` | 캘린더 전체 화면 (Screen) |
| `app/room/[id]/_layout.tsx` | `<Stack.Screen name="calendar" />` 등록 |
| `src/features/recognition/components/CalendarView.tsx` | 캘린더 UI (월 네비게이터 + 그리드 + 범례) |
| `src/features/recognition/components/CalendarDot.tsx` | 날짜별 인식 점 표시 |
| `src/features/recognition/hooks/useCalendar.ts` | 캘린더 데이터 fetch 및 월 이동 로직 |

---

## 3. 변경 목표 (TO-BE)

```
[RoomHeader] 캘린더 아이콘 클릭
  → 바텀시트 열림 (하단에서 위로 슬라이드)
  → 뒷 배경 scrim 처리 (어두운 오버레이)
  → 바텀시트 내에 캘린더 UI 표시 (Calendar Grid + Legend만)
  → Scrim 영역 터치 시 닫힘 (시트가 아래로 내려가는 애니메이션)
  → 캘린더 좌우 스와이프로 월 이동
```

---

## 4. Material Design 3 Date Picker 참고 사항

M3 Modal Date Picker 스펙 기준으로 다음 요소들을 반영한다.

### 4.1 레이아웃 구조

```
┌─────────────────────────────────┐
│         Scrim (배경 어둡게)        │
│        터치 시 시트 닫힘           │
│                                 │
│  ┌───────────────────────────┐  │
│  │       [drag handle]       │  │
│  │  ┌─ Month Navigator ───┐ │  │
│  │  │    Aug  2025         │ │  │  ← 고정 (스와이프 시 텍스트만 갱신)
│  │  └─────────────────────┘ │  │
│  │  ┌─ Calendar Grid ─────┐ │  │
│  │  │  S  M  T  W  T  F  S│ │  │  ← 좌우 스와이프 대상
│  │  │  ... 날짜 그리드 ...   │ │  │  ← 좌우 스와이프 대상
│  │  │  + 인식 indicator     │ │  │  (TODO: dot → 아이콘 전환 예정)
│  │  └─────────────────────┘ │  │
│  │  ┌─ Legend (범례) ──────┐ │  │
│  │  │  ● 멤버1  ● 멤버2 ...│ │  │
│  │  └─────────────────────┘ │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**닫기 버튼 없음** — Scrim 터치 또는 스와이프 다운으로만 닫힘.
**Header 없음** — "날짜 선택" 등의 헤더 텍스트 없이, Month Navigator + Grid + Legend로 구성.

### 4.1.1 좌우 스와이프 월 이동

- 요일 라벨(S M T W T F S)과 날짜 그리드만 좌우 스와이프 애니메이션 대상
- Month Navigator("Aug 2025")는 고정 위치에서 스와이프 완료 시 텍스트만 갱신
- 왼쪽으로 스와이프 → 다음 달로 이동
- 오른쪽으로 스와이프 → 이전 달로 이동
- 스와이프 도중 현재 달 그리드가 스와이프 방향으로 밀려나가고, 새 달 그리드가 반대편에서 들어옴
- 스와이프 거리가 threshold(화면 너비의 30%) 미만이면 원위치로 복귀

### 4.1.2 인식 Indicator (TODO: dot → 아이콘)

현재 날짜별 인식 상태는 컬러 dot(`CalendarDot`)으로 표시한다. 추후 아이콘으로 교체 예정이므로 다음과 같이 확장성을 확보한다.

- `CalendarDayIndicator` 컴포넌트를 추출하여, dot/아이콘 렌더링을 한 곳에서 관리
- indicator 타입을 prop으로 받을 수 있도록 설계 (`type: 'dot' | 'icon'`)
- 코드 내 `// TODO: dot을 아이콘으로 교체 예정` 주석 명시

### 4.2 디자인 토큰 매핑

| 요소 | 토큰 | 값 |
|---|---|---|
| 시트 배경색 | `colors.surfaceContainerHigh` | `#ECE6F0` (light) |
| 시트 모서리 | `shape.extraLarge` | `28px` (상단 좌우만) |
| 시트 그림자 | `elevation(3)` | level 3 |
| Scrim 배경 | `colors.scrim` + opacity 0.32 | `rgba(0,0,0,0.32)` |
| 요일 라벨 | `typography.bodySmall` | S M T W T F S |
| 날짜 숫자 | `typography.bodyLarge` | 일반 날짜 |
| 오늘 날짜 배경 | `colors.primary` | 원형 배경 + `colors.onPrimary` 텍스트 |
| 월 네비게이터 | `typography.titleLarge` | "2025년 8월" |

### 4.3 애니메이션

| 속성 | 토큰 | 설명 |
|---|---|---|
| 시트 진입 | `motion.spatialDefault` | 하단에서 위로 spring 애니메이션 |
| 시트 퇴장 | `motion.spatialFast` | 아래로 빠르게 내려가는 spring 애니메이션 |
| Scrim fade-in | `duration.medium2` (300ms) | opacity 0 → 0.32 |
| Scrim fade-out | `duration.short4` (200ms) | opacity 0.32 → 0 |
| 월 전환 스와이프 | `motion.spatialDefault` | 좌우 slide spring 애니메이션 |
| 월 텍스트 갱신 | 즉시 | 스와이프 완료(settle) 시점에 텍스트 변경 |

---

## 5. 상세 변경 사항

### 5.1 새로 생성할 파일

| 파일 | 설명 |
|---|---|
| `src/components/ui/BottomSheet.tsx` | 범용 바텀시트 컴포넌트 (scrim + slide 애니메이션) |
| `src/features/recognition/components/CalendarBottomSheet.tsx` | 캘린더 전용 바텀시트 (CalendarView를 BottomSheet로 감싸는 래퍼) |
| `src/features/recognition/components/CalendarDayIndicator.tsx` | 날짜별 인식 indicator (현재 dot, 추후 아이콘 전환 대비) |
| `src/features/recognition/components/SwipeableCalendarGrid.tsx` | 좌우 스와이프로 월 전환되는 캘린더 그리드 |

### 5.2 수정할 파일

| 파일 | 변경 내용 |
|---|---|
| `src/features/room/components/RoomHeader.tsx` | `router.push` 제거 → `onCalendarPress` 콜백 prop으로 변경 |
| `app/room/[id]/index.tsx` | 캘린더 바텀시트 state 관리 (`isCalendarOpen`), `<CalendarBottomSheet />` 렌더링 |
| `src/features/recognition/components/CalendarView.tsx` | Header 제거, CalendarDot → CalendarDayIndicator 전환, SwipeableCalendarGrid 적용 |

### 5.3 삭제(또는 비활성화)할 파일

| 파일 | 사유 |
|---|---|
| `app/room/[id]/calendar.tsx` | 더 이상 별도 페이지 불필요 |
| `app/room/[id]/_layout.tsx` 내 `calendar` Screen 등록 | Stack.Screen 제거 |

---

## 6. 컴포넌트 설계

### 6.1 BottomSheet (범용)

```typescript
type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};
```

**동작:**
- `visible=true` → scrim fade-in + 시트 slide-up (react-native-reanimated 사용)
- Scrim 영역 터치 → `onClose` 호출 → 시트 slide-down 애니메이션 후 닫힘
- `visible=false` → 시트 slide-down + scrim fade-out → unmount
- 닫기 버튼 없음 (Scrim 터치로만 닫힘)

**스타일:**
- 시트: `surfaceContainerHigh`, `borderTopLeftRadius: 28`, `borderTopRightRadius: 28`, `elevation(3)`
- Scrim: `position: absolute`, `backgroundColor: scrim`, `opacity: 0.32`
- 시트 상단 중앙에 drag handle bar 표시 (width: 32, height: 4, borderRadius: 2, backgroundColor: onSurfaceVariant, opacity: 0.4)

### 6.2 CalendarBottomSheet

```typescript
type CalendarBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  members: RoomMember[];
};
```

**동작:**
- `useCalendar(roomId)` 훅으로 데이터 fetch
- `CalendarView`를 `BottomSheet` 안에 렌더링
- 닫기 버튼 없음 (Scrim 터치로 닫힘)
- 좌우 스와이프로 월 이동

### 6.3 SwipeableCalendarGrid (좌우 스와이프 월 전환)

```typescript
type SwipeableCalendarGridProps = {
  year: number;
  month: number;
  days: CalendarDay[];
  members: RoomMember[];
  onMonthChange: (direction: 'prev' | 'next') => void;
};
```

**동작:**
- 현재 월, 이전 월, 다음 월 총 3개의 그리드를 가로로 나란히 배치 (off-screen)
- `PanGestureHandler`로 좌우 드래그 감지
- 드래그 중: 요일 라벨 + 날짜 그리드가 translateX로 이동 (Month Navigator는 고정)
- 드래그 거리 > 화면 너비의 30%: 스와이프 확정 → spring 애니메이션으로 다음/이전 달 슬라이드 완료 → `onMonthChange` 호출
- 드래그 거리 < 30%: spring으로 원위치 복귀
- 스와이프 완료 시점에 Month Navigator 텍스트(예: "2025년 8월") 갱신

**구현 핵심:**
- `Animated.Value` 또는 `useSharedValue`로 translateX 관리
- 이전/현재/다음 달 그리드를 수평 배치, 현재 달만 보이도록 `overflow: hidden`
- 스와이프 확정 후 데이터 refetch 및 그리드 재정렬

### 6.4 CalendarDayIndicator (확장 가능한 indicator)

```typescript
// TODO: dot을 아이콘으로 교체 예정
type IndicatorType = 'dot' | 'icon';

type CalendarDayIndicatorProps = {
  colors: string[];
  type?: IndicatorType;  // 기본값: 'dot'
  // TODO: 아이콘 전환 시 추가될 props
  // icons?: string[];
};
```

**동작:**
- `type='dot'` (기본): 기존 `CalendarDot`과 동일한 컬러 점 렌더링
- `type='icon'`: 추후 아이콘 렌더링 로직 추가 예정 (현재는 dot fallback)
- `CalendarDot.tsx`의 로직을 이전하고, `CalendarDot`은 deprecated 또는 삭제

### 6.5 RoomHeader 변경

```typescript
// AS-IS
type RoomHeaderProps = {
  roomName: string;
  roomId: string;
};

// TO-BE
type RoomHeaderProps = {
  roomName: string;
  roomId: string;
  onCalendarPress: () => void;  // 추가
};
```

캘린더 아이콘의 `onPress`를 `router.push(...)` → `onCalendarPress()` 로 변경.

### 6.6 RoomScreen (app/room/[id]/index.tsx) 변경

```typescript
// 추가할 상태
const [isCalendarOpen, setIsCalendarOpen] = useState(false);

// RoomHeader에 콜백 전달
<RoomHeader
  roomName={room.name}
  roomId={id}
  onCalendarPress={() => setIsCalendarOpen(true)}
/>

// 바텀시트 렌더링 (최하단)
<CalendarBottomSheet
  visible={isCalendarOpen}
  onClose={() => setIsCalendarOpen(false)}
  roomId={id}
  members={room.members}
/>
```

---

## 7. 의존성

### 필수 (이미 설치됨)
- `react-native-reanimated` — 애니메이션
- `react-native-gesture-handler` — 스와이프 제스처

### 추가 설치 불필요
- 외부 바텀시트 라이브러리 사용하지 않고 직접 구현 (프로젝트 디자인 토큰과 완전한 일관성 유지)

---

## 8. 접근성 (Accessibility)

- 시트 열릴 때 `accessibilityViewIsModal={true}` 설정
- Scrim에 `accessibilityLabel="닫기"` 및 `accessibilityRole="button"` 적용
- 시트 열릴 때 포커스를 시트 내부로 이동

---

## 9. 작업 체크리스트

- [ ] `BottomSheet.tsx` 범용 컴포넌트 구현
  - [ ] Scrim 오버레이 (fade 애니메이션)
  - [ ] 시트 slide-up/down 애니메이션 (spring)
  - [ ] Scrim 터치 닫기 (slide-down 애니메이션 포함)
  - [ ] Drag handle bar
- [ ] `CalendarDayIndicator.tsx` 구현
  - [ ] 현재는 dot 렌더링 (CalendarDot 로직 이전)
  - [ ] `// TODO: dot을 아이콘으로 교체 예정` 주석 추가
  - [ ] indicator type prop 확장 대비 (`'dot' | 'icon'`)
- [ ] `SwipeableCalendarGrid.tsx` 구현
  - [ ] 좌우 pan gesture 감지
  - [ ] 현재 달 / 이전 달 / 다음 달 그리드를 나란히 배치
  - [ ] 스와이프 시 요일 라벨 + 날짜 그리드만 슬라이드
  - [ ] threshold(30%) 미만이면 원위치 복귀
  - [ ] 스와이프 완료 시 `onMonthChange` 콜백 호출
- [ ] `CalendarView.tsx` 수정
  - [ ] Header 제거
  - [ ] CalendarDot → CalendarDayIndicator 전환
  - [ ] 기존 그리드를 SwipeableCalendarGrid로 교체
  - [ ] Month Navigator 고정, 스와이프 완료 시 텍스트만 갱신
- [ ] `CalendarBottomSheet.tsx` 구현
  - [ ] CalendarView + useCalendar 통합
  - [ ] 닫기 버튼 없음 (Scrim 터치로 닫힘)
- [ ] `RoomHeader.tsx` 수정
  - [ ] `onCalendarPress` prop 추가
  - [ ] `router.push` → `onCalendarPress` 전환
- [ ] `app/room/[id]/index.tsx` 수정
  - [ ] `isCalendarOpen` 상태 추가
  - [ ] `CalendarBottomSheet` 렌더링
- [ ] `app/room/[id]/calendar.tsx` 삭제
- [ ] `app/room/[id]/_layout.tsx`에서 calendar Screen 등록 제거
- [ ] 동작 테스트
  - [ ] 캘린더 아이콘 클릭 → 바텀시트 열림
  - [ ] Scrim 터치 → 시트 내려가며 닫힘
  - [ ] 좌우 스와이프 → 월 전환 (그리드만 슬라이드, 월 텍스트 갱신)
  - [ ] 인식 dot 정상 표시
  - [ ] dot → 아이콘 전환 시 CalendarDayIndicator만 수정하면 되는지 확인

