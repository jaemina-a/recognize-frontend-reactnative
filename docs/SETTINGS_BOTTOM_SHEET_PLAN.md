# 방 설정 바텀시트 전환 기획서

## 1. 개요

설정 아이콘을 누르면 별도 페이지(`/room/[id]/settings`)로 이동하는 현재 방식을, **바텀시트(Bottom Sheet)** 형태로 변경한다. 캘린더 바텀시트와 동일하게, 화면 하단에서 부드럽게 올라오는 모달 시트에 설정 내용을 표시하고, 뒷 배경은 scrim(반투명 어두운 오버레이)으로 처리한다.

기존에 구현된 `BottomSheet` 범용 컴포넌트를 재사용한다.

---

## 2. 현재 구조 (AS-IS)

```
[RoomHeader] 설정 아이콘 클릭
  → router.push(`/room/${roomId}/settings`)
    → app/room/[id]/settings.tsx (전체 페이지)
      → InviteCodeCard + MemberList + 방 나가기 버튼
```

### 관련 파일

| 파일 | 역할 |
|---|---|
| `src/features/room/components/RoomHeader.tsx` | 설정 아이콘 버튼, `router.push`로 페이지 이동 |
| `app/room/[id]/settings.tsx` | 설정 전체 화면 (Screen) |
| `app/room/[id]/_layout.tsx` | `<Stack.Screen name="settings" />` 등록 |
| `src/features/room/components/InviteCodeModal.tsx` | 초대코드 카드 컴포넌트 (`InviteCodeCard`) |
| `src/features/room/components/MemberList.tsx` | 멤버 랭킹 목록 컴포넌트 |

---

## 3. 변경 목표 (TO-BE)

```
[RoomHeader] 설정 아이콘 클릭
  → 바텀시트 열림 (하단에서 위로 슬라이드)
  → 뒷 배경 scrim 처리 (어두운 오버레이)
  → 바텀시트 내에 설정 UI 표시:
      1. 초대코드 카드
      2. 멤버 랭킹
  → Scrim 영역 터치 시 닫힘 (시트가 아래로 내려가는 애니메이션)
```

---

## 4. 레이아웃 구조

```
┌─────────────────────────────────┐
│         Scrim (배경 어둡게)        │
│        터치 시 시트 닫힘           │
│                                 │
│  ┌───────────────────────────┐  │
│  │       [drag handle]       │  │
│  │                           │  │
│  │  ┌─ InviteCodeCard ────┐  │  │
│  │  │  초대코드              │  │  │
│  │  │  [ABCDEF]   [복사]    │  │  │
│  │  └────────────────────┘  │  │
│  │                           │  │
│  │  ┌─ MemberList ────────┐  │  │
│  │  │  멤버 랭킹             │  │  │
│  │  │  1. 닉네임  100점      │  │  │
│  │  │  2. 닉네임   80점      │  │  │
│  │  │  ...                  │  │  │
│  │  └────────────────────┘  │  │
│  │                           │  │
│  │  [방 나가기]               │  │
│  │                           │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**닫기 버튼 없음** — Scrim 터치로만 닫힘.
**Header 없음** — "방 설정" 등의 헤더 텍스트 없이, 바로 컨텐츠 표시.

---

## 5. 디자인 토큰 매핑

캘린더 바텀시트와 동일한 디자인 토큰 적용.

| 요소 | 토큰 | 값 |
|---|---|---|
| 시트 배경색 | `colors.surfaceContainerHigh` | `#ECE6F0` (light) |
| 시트 모서리 | `shape.extraLarge` | `28px` (상단 좌우만) |
| 시트 그림자 | `elevation(3)` | level 3 |
| Scrim 배경 | `colors.scrim` + opacity 0.32 | `rgba(0,0,0,0.32)` |

---

## 6. 애니메이션

캘린더 바텀시트와 동일.

| 속성 | 토큰 | 설명 |
|---|---|---|
| 시트 진입 | `motion.spatialDefault` | 하단에서 위로 spring 애니메이션 |
| 시트 퇴장 | `motion.spatialFast` | 아래로 빠르게 내려가는 spring 애니메이션 |
| Scrim fade-in | `duration.medium2` (300ms) | opacity 0 → 0.32 |
| Scrim fade-out | `duration.short4` (200ms) | opacity 0.32 → 0 |

---

## 7. 상세 변경 사항

### 7.1 새로 생성할 파일

| 파일 | 설명 |
|---|---|
| `src/features/room/components/SettingsBottomSheet.tsx` | 설정 전용 바텀시트 (BottomSheet로 감싼 InviteCodeCard + MemberList + 방 나가기) |

### 7.2 수정할 파일

| 파일 | 변경 내용 |
|---|---|
| `src/features/room/components/RoomHeader.tsx` | `router.push` 제거 → `onSettingsPress` 콜백 prop 추가 |
| `app/room/[id]/index.tsx` | 설정 바텀시트 state 관리 (`isSettingsOpen`), `<SettingsBottomSheet />` 렌더링 |

### 7.3 삭제(또는 비활성화)할 파일

| 파일 | 사유 |
|---|---|
| `app/room/[id]/settings.tsx` | 더 이상 별도 페이지 불필요 |
| `app/room/[id]/_layout.tsx` 내 `settings` Screen 등록 | Stack.Screen 제거 |

---

## 8. 컴포넌트 설계

### 8.1 SettingsBottomSheet

```typescript
type SettingsBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  inviteCode: string;
  members: RoomMember[];
};
```

**동작:**
- 기존 `BottomSheet` 범용 컴포넌트 재사용
- 시트 내부 레이아웃:
  1. `InviteCodeCard` — 초대코드 카드 (기존 컴포넌트 그대로 사용)
  2. `MemberList` — 멤버 랭킹 (기존 컴포넌트 그대로 사용)
  3. "방 나가기" 텍스트 버튼 — 기존 `Alert.alert` 확인 로직 유지
- 멤버가 많을 경우를 대비하여 내부 `ScrollView` 사용
- 닫기 버튼 없음 (Scrim 터치로 닫힘)

### 8.2 RoomHeader 변경

```typescript
// AS-IS
type RoomHeaderProps = {
  roomName: string;
  roomId: string;
  onCalendarPress: () => void;
};

// TO-BE
type RoomHeaderProps = {
  roomName: string;
  roomId: string;
  onCalendarPress: () => void;
  onSettingsPress: () => void;  // 추가
};
```

설정 아이콘의 `onPress`를 `router.push(...)` → `onSettingsPress()` 로 변경.

### 8.3 RoomScreen (app/room/[id]/index.tsx) 변경

```typescript
// 추가할 상태
const [isSettingsOpen, setIsSettingsOpen] = useState(false);

// RoomHeader에 콜백 전달
<RoomHeader
  roomName={room.name}
  roomId={id}
  onCalendarPress={() => setIsCalendarOpen(true)}
  onSettingsPress={() => setIsSettingsOpen(true)}
/>

// 바텀시트 렌더링 (최하단, CalendarBottomSheet 아래)
<SettingsBottomSheet
  visible={isSettingsOpen}
  onClose={() => setIsSettingsOpen(false)}
  roomId={id}
  inviteCode={room.inviteCode}
  members={room.members}
/>
```

---

## 9. 기존 컴포넌트 재사용

| 컴포넌트 | 수정 필요 여부 | 비고 |
|---|---|---|
| `BottomSheet` | 없음 | 캘린더에서 이미 구현한 범용 바텀시트 |
| `InviteCodeCard` | 없음 | 그대로 바텀시트 내부에 렌더링 |
| `MemberList` | 없음 | 그대로 바텀시트 내부에 렌더링 |
| `Button` | 없음 | "방 나가기" 텍스트 버튼 |

---

## 10. 작업 체크리스트

- [ ] `SettingsBottomSheet.tsx` 구현
  - [ ] BottomSheet 내부에 ScrollView 배치
  - [ ] InviteCodeCard 렌더링
  - [ ] MemberList 렌더링
  - [ ] "방 나가기" 버튼 + Alert 확인 로직
  - [ ] Safe area 하단 여백
- [ ] `RoomHeader.tsx` 수정
  - [ ] `onSettingsPress` prop 추가
  - [ ] `router.push` → `onSettingsPress` 전환
- [ ] `app/room/[id]/index.tsx` 수정
  - [ ] `isSettingsOpen` 상태 추가
  - [ ] `SettingsBottomSheet` 렌더링
- [ ] `app/room/[id]/settings.tsx` 삭제
- [ ] `app/room/[id]/_layout.tsx`에서 settings Screen 등록 제거
- [ ] 동작 테스트
  - [ ] 설정 아이콘 클릭 → 바텀시트 열림
  - [ ] Scrim 터치 → 시트 내려가며 닫힘
  - [ ] 초대코드 복사 정상 동작
  - [ ] 멤버 랭킹 정상 표시
  - [ ] "방 나가기" Alert 확인 후 방 퇴장 정상 동작
