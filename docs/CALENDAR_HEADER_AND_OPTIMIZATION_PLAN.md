# 캘린더 헤더 / 데이터 / 렌더 최적화 기획서

## 1. 개요

캘린더 바텀시트의 사용성과 시각적 안정성을 개선하기 위해 다음 4가지를 수정한다.

1. **헤더 재구성** — 좌측에 "August 2025 ▼" (월/년 picker 트리거) + 우측에 `<` `>` 버튼
2. **월/년 picker** — 좌측 텍스트 클릭 시 상하 슬라이드(스크롤 휠) picker로 월/년 직접 선택
3. **데이터 prefetch & 캐싱** — 캘린더 오픈 시 광범위(±N개월) 데이터를 한 번에 fetch 후 메모리 캐싱하여 월 전환 시 dot 로딩 딜레이 제거
4. **스와이프 잔상 제거 & 6행 고정 높이** — 월 전환 시 이전 달이 한 프레임 깜빡이는 문제 해결, 행 수와 indicator 영역 모두 고정 높이화

---

## 2. 문제 분석 (AS-IS)

### 2.1 헤더가 단조로움
```
        2025년 8월
```
- 단순 텍스트만 가운데 정렬
- 월 이동은 스와이프로만 가능 (불편)
- 빠르게 임의의 달로 이동하려면 여러 번 스와이프 필요

### 2.2 dot 로딩 딜레이
현재 [`useCalendar.ts`](src/features/recognition/hooks/useCalendar.ts):
```typescript
useEffect(() => { refetch(); }, [refetch]);  // year/month 변경 시마다 fetch
```
- 스와이프 완료 → `onMonthChange` 호출 → state 업데이트 → useEffect 트리거 → API 요청 → 응답 → 렌더
- 이 과정에서 **수백 ms 딜레이** 발생, dot이 "뒤늦게" 그려지는 시각적 결함

### 2.3 월 전환 시 이전 달이 한 프레임 깜빡임
[`SwipeableCalendarGrid.tsx`](src/features/recognition/components/SwipeableCalendarGrid.tsx) `handleMonthChange`:
```typescript
const handleMonthChange = useCallback((dir) => {
  translateX.value = -PANEL_WIDTH;   // ① 즉시 중앙으로 리셋
  onMonthChange(dir);                 // ② 비동기 state 업데이트
}, [onMonthChange]);
```
**문제 흐름:**
1. 스와이프 → `withSpring` 으로 `translateX = -2 * PANEL_WIDTH` (다음 달이 중앙에 표시됨)
2. spring 완료 콜백에서 `translateX = -PANEL_WIDTH` 즉시 리셋
3. **이 시점**의 패널 배열은 여전히 `[old_prev, old_current, old_next]` → 중앙에 `old_current`가 노출됨
4. React state 업데이트가 다음 프레임에 반영되어 `[new_prev=old_current, new_current=old_next, new_next=...]` 으로 재배치됨

→ **1프레임(~16ms)** 동안 사용자가 "방금 떠난 월"을 다시 보게 됨.

### 2.4 행 개수에 따라 캘린더 높이 변화
- 5주 달(예: 2026년 2월) vs 6주 달의 행 수가 다름
- 또한 dot이 있는 날은 셀 높이가 늘어나 그리드가 들쭉날쭉
- 결과: 월 전환할 때마다 캘린더 컨테이너 높이가 달라져 시트 전체가 위아래로 미세하게 움직임

---

## 3. 변경 목표 (TO-BE)

### 3.1 새 헤더 디자인 (Material 3 Date Picker 참고)

```
┌────────────────────────────────────────┐
│  August 2025  ▼              <    >    │
└────────────────────────────────────────┘
   └─ 클릭 → Month/Year Picker
                              └─ 이전/다음 달 이동
```

### 3.2 Month/Year Picker (상하 슬라이드)

좌측 텍스트(`August 2025 ▼`) 클릭 시, **시트 내부**에서 그리드 영역이 picker로 전환된다 (또는 그리드 위에 오버레이).

```
┌─────────────────────────────────┐
│  August 2025  ▼          <  >   │
├─────────────────────────────────┤
│   ┌─ Month ──┐  ┌─ Year ──┐    │
│   │  June    │  │  2023   │    │
│   │  July    │  │  2024   │    │
│   │ ►August◄ │  │ ►2025◄  │    │  ← 가운데 선택 표시
│   │  Sept.   │  │  2026   │    │
│   │  October │  │  2027   │    │
│   └──────────┘  └─────────┘    │
└─────────────────────────────────┘
```

- 두 개의 휠(month, year) — 상하 스크롤로 선택
- 가운데 라인이 현재 선택값
- 한 번 더 `▼` 클릭 또는 외곽 터치로 그리드 복귀
- React Native에서 `ScrollView` + `snapToInterval` 로 구현

---

## 4. 데이터 prefetch & 캐싱 전략

### 4.1 캐싱 구조

```typescript
type CalendarCache = Map<string /* "YYYY-MM" */, CalendarDay[]>;
```

- key: `"2025-08"` 형식
- value: 해당 월의 `CalendarDay[]`
- 캐시는 `useCalendar` 훅 내부 `useRef<CalendarCache>`로 관리

### 4.2 fetch 전략

**초기 오픈 시:**
- 현재 월 + 이전 6개월 + 이후 6개월 = **총 13개월** 한 번에 병렬 fetch (`Promise.all`)
- 각 응답을 캐시에 저장
- 화면에는 현재 월 데이터만 즉시 표시

**월 전환 시:**
- 캐시 hit → 즉시 렌더 (API 호출 없음, **딜레이 0**)
- 캐시 miss → fetch 후 캐시에 저장하고 렌더 (예외적 케이스, 보통 발생하지 않음)

**점진적 확장 (선택):**
- 캐시된 범위의 끝(예: -6개월)에 도달하면 추가 6개월 백그라운드 prefetch

### 4.3 백엔드 영향

- 백엔드 API는 변경하지 않음 (`GET /rooms/:roomId/calendar?year&month` 그대로)
- 13개의 병렬 요청이 발생하지만, 캘린더 오픈 시 1회뿐이며 응답이 가벼우므로 부담 적음
- (선택) 추후 백엔드에 `year+month range` 또는 `from/to` 쿼리 지원 추가 시 1회 호출로 단축 가능 — 본 기획에서는 다루지 않음

### 4.4 무효화

- 사진 업로드/인식 후에는 해당 월의 캐시 entry를 무효화
- 가장 간단하게는 시트가 다시 열릴 때 전체 캐시 reset (시트가 닫혔다 열리는 빈도가 낮으므로 충분)

---

## 5. 스와이프 잔상(1프레임 깜빡임) 해결

### 5.1 원인 재정리

스프링 애니메이션 완료 콜백에서 `translateX`를 동기 리셋하지만, 패널 데이터는 React state 업데이트(비동기) 이후에야 재배치됨. 이 시간차로 1프레임 동안 "잘못된 패널"이 중앙에 노출됨.

### 5.2 해결 전략

**옵션 A — `useLayoutEffect`로 state 커밋 직후 translateX 리셋** ✅ (채택)

```typescript
// SwipeableCalendarGrid.tsx
useLayoutEffect(() => {
  // year/month가 바뀌어 패널이 새 데이터로 재배치된 직후 실행됨.
  // 이 시점에 translateX를 -PANEL_WIDTH로 즉시 리셋하면 깜빡임 없음.
  translateX.value = -PANEL_WIDTH;
}, [year, month]);
```

스와이프 종료 시 흐름 변경:
1. spring으로 `-2 * PANEL_WIDTH` 까지 이동 완료 (다음 달 표시)
2. 콜백에서 `onMonthChange('next')`만 호출 (translateX는 건드리지 않음)
3. 부모가 year/month 갱신 → 자식 재렌더 → `useLayoutEffect`에서 translateX를 동일 프레임에 리셋
4. 사용자에게는 끊김 없이 자연스럽게 보임

**옵션 B — 단일 패널 + 키 변경** (대안, 채택하지 않음)
- 매 월 변경 시 컴포넌트를 새로 mount → 애니메이션 구현 복잡

**옵션 C — react-native-pager-view 사용** (대안, 채택하지 않음)
- 추가 의존성 도입, 현재 규모에서는 과한 변경

---

## 6. 6행 고정 높이 & indicator 고정 영역

### 6.1 행 개수 고정

```typescript
function buildRows(year: number, month: number): (number | null)[][] {
  // ... 기존 cells 생성 ...
  while (cells.length < 42) cells.push(null);  // 6행 × 7열 = 42칸 강제
  // ...
}
```
- 모든 달이 정확히 **6행** 렌더링
- 5주 달은 마지막 행이 빈 셀(`null`)

### 6.2 셀 고정 높이

각 셀(`<View>`)의 높이를 고정값으로 변경.

```typescript
const CELL_HEIGHT = 56;            // 행 고정 높이
const DATE_CIRCLE_SIZE = 32;       // 날짜 원형
const INDICATOR_HEIGHT = 8;        // dot/아이콘 영역 고정 높이

<View style={{
  flex: 1,
  height: CELL_HEIGHT,             // ← minHeight → height
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: 6,
}}>
  <View style={{ width: DATE_CIRCLE_SIZE, height: DATE_CIRCLE_SIZE, ... }}>
    <Text>{day}</Text>
  </View>
  <View style={{ height: INDICATOR_HEIGHT, marginTop: 4 }}>
    <CalendarDayIndicator colors={dotColors} />
  </View>
</View>
```

- `CalendarDayIndicator`도 dot 유무와 관계없이 동일한 외부 컨테이너 높이 사용
- dot이 늘어나도 행 높이가 변하지 않음
- 그리드 전체 높이 = `CELL_HEIGHT × 6` = 고정

---

## 7. 상세 변경 사항

### 7.1 새로 생성할 파일

| 파일 | 설명 |
|---|---|
| `src/features/recognition/components/CalendarHeader.tsx` | 좌측 month/year 트리거 + 우측 chevron 버튼 헤더 |
| `src/features/recognition/components/MonthYearPicker.tsx` | 상하 스크롤 휠 picker (month, year 2개) |

### 7.2 수정할 파일

| 파일 | 변경 내용 |
|---|---|
| `src/features/recognition/hooks/useCalendar.ts` | 캐싱 + prefetch 로직 추가, `setMonth/setYear` 직접 노출, `goToMonth(year, month)` 추가 |
| `src/features/recognition/components/SwipeableCalendarGrid.tsx` | `useLayoutEffect`로 translateX 동기 리셋, 6행 고정, 셀 고정 높이, indicator 고정 영역 |
| `src/features/recognition/components/CalendarView.tsx` | 기존 헤더 → `<CalendarHeader />` 교체, picker 토글 state |
| `src/features/recognition/components/CalendarBottomSheet.tsx` | `useCalendar`에서 `goToMonth` 등 새로운 API 전달 |
| `src/features/recognition/components/CalendarDayIndicator.tsx` | 외부 컨테이너 고정 높이 적용 (dot 없을 때도 자리 차지) |

---

## 8. 컴포넌트 설계

### 8.1 CalendarHeader

```typescript
type CalendarHeaderProps = {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onTogglePicker: () => void;
  isPickerOpen: boolean;
};
```

**레이아웃:**
- 좌측: `<Pressable onPress={onTogglePicker}>` → "August 2025 ▼" (Material Symbols `arrow-drop-down`, picker 열려있으면 `arrow-drop-up`)
- 우측: `<IconButton icon="chevron-left" onPress={onPrev} />`, `<IconButton icon="chevron-right" onPress={onNext} />`
- 월 표기: 영어 단축형(`Jan`, `Feb`, ...) — `Date.prototype.toLocaleString('en-US', { month: 'long' })` 사용

### 8.2 MonthYearPicker

```typescript
type MonthYearPickerProps = {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
};
```

**구현:**
- 가로 2분할 → 각각 세로 `ScrollView`
- `snapToInterval={ITEM_HEIGHT}`, `decelerationRate="fast"`, `showsVerticalScrollIndicator={false}`
- 가운데 선택 인디케이터(상하 가로선 또는 배경 highlight)
- 스크롤 종료 시 `onMomentumScrollEnd`에서 `Math.round(offsetY / ITEM_HEIGHT)`로 인덱스 계산 → `onChange(newYear, newMonth)` 호출
- year 범위: 현재 년 ±10년 (캐시 prefetch 범위와 무관, 사용자 선택 자유도)
- month 범위: 1~12 (영어 단축형 표기)

**스타일 토큰:**
- 아이템 높이 `ITEM_HEIGHT = 44`
- 보이는 항목 수 5개 (가운데 1 + 상하 각 2)
- 가운데 highlight: `colors.primaryContainer` 배경, `borderRadius: shape.medium`

### 8.3 useCalendar (변경)

```typescript
export function useCalendar(roomId: string) {
  const cacheRef = useRef<Map<string, CalendarDay[]>>(new Map());
  const [year, setYear] = useState<number>(...);
  const [month, setMonth] = useState<number>(...);
  const [days, setDays] = useState<CalendarDay[]>([]);

  // Prefetch ±6 months on mount
  useEffect(() => {
    const tasks: Promise<void>[] = [];
    for (let delta = -6; delta <= 6; delta++) {
      const { year: y, month: m } = offsetMonth(year, month, delta);
      tasks.push(
        recognitionApi.getCalendar(roomId, y, m).then((data) => {
          cacheRef.current.set(key(y, m), data);
        }),
      );
    }
    Promise.all(tasks).then(() => {
      // 현재 월 데이터로 화면 갱신
      setDays(cacheRef.current.get(key(year, month)) ?? []);
    });
  }, [roomId]);

  // year/month 변경 시 캐시 hit이면 즉시 반영, miss면 fetch
  useEffect(() => {
    const cached = cacheRef.current.get(key(year, month));
    if (cached) {
      setDays(cached);
    } else {
      recognitionApi.getCalendar(roomId, year, month).then((data) => {
        cacheRef.current.set(key(year, month), data);
        setDays(data);
      });
    }
  }, [roomId, year, month]);

  const goToPrevMonth = () => { /* 기존 동일 */ };
  const goToNextMonth = () => { /* 기존 동일 */ };
  const goToMonth = (y: number, m: number) => { setYear(y); setMonth(m); };

  return { year, month, days, goToPrevMonth, goToNextMonth, goToMonth };
}
```

### 8.4 SwipeableCalendarGrid (변경 핵심)

```typescript
export function SwipeableCalendarGrid({ year, month, daysByMonth, onMonthChange }) {
  const translateX = useSharedValue(-PANEL_WIDTH);

  // ★ state 변경 직후 동기 리셋 → 1프레임 깜빡임 제거
  useLayoutEffect(() => {
    translateX.value = -PANEL_WIDTH;
  }, [year, month]);

  // 이전/다음 달 데이터도 prop으로 받아서 즉시 표시
  // → daysByMonth: Map<"YYYY-MM", CalendarDay[]>
  const prevDays = daysByMonth.get(key(prev)) ?? [];
  const currDays = daysByMonth.get(key(curr)) ?? [];
  const nextDays = daysByMonth.get(key(next)) ?? [];

  // pan onEnd: translateX 리셋 제거, onMonthChange만 호출
  // ...
}
```

**6행 고정 적용:**
```typescript
function buildRows(year, month) {
  // ... 기존 ...
  while (cells.length < 42) cells.push(null);
  // ... rows 6개 반환 보장
}
```

**셀 고정 높이:** `paddingVertical` → `height: CELL_HEIGHT`로 변경

### 8.5 CalendarView (변경)

```typescript
export function CalendarView({ year, month, daysByMonth, members, onMonthChange, onGoToMonth }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <View>
      <CalendarHeader
        year={year}
        month={month}
        onPrev={() => onMonthChange('prev')}
        onNext={() => onMonthChange('next')}
        onTogglePicker={() => setIsPickerOpen(v => !v)}
        isPickerOpen={isPickerOpen}
      />

      {isPickerOpen ? (
        <MonthYearPicker
          year={year}
          month={month}
          onChange={(y, m) => { onGoToMonth(y, m); setIsPickerOpen(false); }}
        />
      ) : (
        <SwipeableCalendarGrid
          year={year}
          month={month}
          daysByMonth={daysByMonth}
          onMonthChange={onMonthChange}
        />
      )}

      <Legend members={members} />
    </View>
  );
}
```

### 8.6 CalendarDayIndicator (변경)

```typescript
const INDICATOR_HEIGHT = 8;

export function CalendarDayIndicator({ colors, type = 'dot' }) {
  return (
    <View style={{
      height: INDICATOR_HEIGHT,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 2,
      marginTop: 4,
    }}>
      {colors.map((color, i) => (
        <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      ))}
    </View>
  );
}
```

→ 빈 indicator도 동일 높이로 자리 차지하므로 행 높이 일정.

---

## 9. 디자인 토큰

| 요소 | 토큰 / 값 |
|---|---|
| Cell 고정 높이 | `56px` |
| 날짜 원형 | `32px` × `32px`, `borderRadius: 16` |
| Indicator 영역 높이 | `8px` (고정) |
| dot 크기 | `6px` × `6px` |
| Picker item 높이 | `44px` |
| Picker 표시 항목 수 | 5개 |
| Picker 가운데 highlight | `colors.primaryContainer`, `shape.medium` |
| Header chevron 버튼 | `IconButton variant="standard"` |
| Header month/year 텍스트 | `typography.titleMedium`, `colors.onSurface` |
| Drop arrow 아이콘 | `arrow-drop-down` / `arrow-drop-up` |

---

## 10. 작업 체크리스트

- [ ] `useCalendar.ts` 캐싱 도입
  - [ ] `cacheRef` Map 추가
  - [ ] mount 시 ±6개월 병렬 prefetch
  - [ ] year/month 변경 시 캐시 hit 우선 반영
  - [ ] `goToMonth(year, month)` 함수 추가
- [ ] `daysByMonth` 형태로 SwipeableCalendarGrid에 데이터 전달 (이전/현재/다음 달 동시 표시)
- [ ] `SwipeableCalendarGrid.tsx` 잔상 제거
  - [ ] pan `onEnd`에서 translateX 리셋 제거
  - [ ] `useLayoutEffect`로 year/month 변경 시 translateX 동기 리셋
- [ ] 6행 고정
  - [ ] `buildRows`에서 cells.length를 42로 padding
  - [ ] 모든 행/셀 고정 높이 적용 (`CELL_HEIGHT = 56`)
- [ ] `CalendarDayIndicator.tsx` 고정 높이 적용
- [ ] `CalendarHeader.tsx` 신규 구현
  - [ ] 좌측 "Month YYYY ▼" Pressable
  - [ ] 우측 chevron 좌/우 버튼
  - [ ] 영어 월 이름 표기 (`toLocaleString('en-US', { month: 'long' })`)
- [ ] `MonthYearPicker.tsx` 신규 구현
  - [ ] month / year ScrollView 2개
  - [ ] `snapToInterval` + `onMomentumScrollEnd`
  - [ ] 가운데 선택 highlight
- [ ] `CalendarView.tsx` 헤더 교체 + picker 토글 state
- [ ] `CalendarBottomSheet.tsx` props 갱신 (`daysByMonth`, `onGoToMonth` 전달)
- [ ] 동작 테스트
  - [ ] 캘린더 오픈 → ±6개월 prefetch 완료 후 dot 즉시 표시
  - [ ] 좌우 스와이프 → dot 즉시 표시 (딜레이 0)
  - [ ] 좌우 스와이프 → 이전 달 깜빡임 없음
  - [ ] 헤더 chevron 버튼 → 부드러운 월 전환 (스와이프와 동일한 spring 애니메이션 유지 또는 즉시 전환)
  - [ ] "Month YYYY ▼" 클릭 → picker 노출, 휠 스크롤로 월/년 선택 → 그리드로 복귀
  - [ ] 5주 달 / 6주 달 모두 캘린더 높이 동일
  - [ ] dot 개수에 무관하게 행 높이 일정
