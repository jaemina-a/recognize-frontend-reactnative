# Web vs Android 스타일 차이 원인 분석

## 요약

**근본 원인: `react-native-css-interop@0.2.3`이 Pressable의 function-style을 빈 객체로 변환하는 버그.**

NativeWind v4의 `jsxImportSource: "nativewind"` 설정으로 인해 모든 JSX가 `react-native-css-interop`의 interop 레이어를 통과합니다. Pressable에 `style={({pressed}) => ...}` 패턴을 사용하면, interop이 이 함수를 일반 style 객체로 처리하여 `{...function}` = `{}`(빈 객체)로 변환합니다. 결과적으로 **Pressable의 모든 inline style이 Android에서 사라집니다.**

Web에서는 `react-native-css-interop`의 web 런타임(`api.js`)이 다른 코드 경로를 사용하므로 문제가 발생하지 않습니다.

### 해결 방법
function-style을 사용하는 모든 Pressable에 `cssInterop={false}` prop을 추가하여 interop 우회:
```tsx
<Pressable cssInterop={false} style={({pressed}) => ({opacity: pressed ? 0.88 : 1})} />
```

---

## ISSUE 1 (CRITICAL): `inset: 0` CSS 단축 속성 — Android 미지원

**파일:** `src/features/recognition/components/RecognitionCard.tsx`

```tsx
<View style={{ position: 'absolute', inset: 0, backgroundColor: colors.surfaceContainerHighest } as any} />
```

### 원인
- `inset`는 Web CSS 단축 속성으로, `top: 0; right: 0; bottom: 0; left: 0`으로 풀어지는 문법
- React Native의 Yoga 레이아웃 엔진에는 `inset` 속성이 **존재하지 않음**
- `as any`로 TypeScript 에러를 무시하고 있음
- Android에서는 무시되어 해당 View가 `0×0` 크기로 렌더링됨

### 수정안
```tsx
// Before
style={{ position: 'absolute', inset: 0, ... } as any}

// After
style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, ... }}
```

---

## ISSUE 2 (HIGH): 로그인 버튼 — `gap` + `flexWrap` + `flexBasis: '%'` 레이아웃 차이

**파일:** `src/features/auth/components/LoginScreen.tsx`

```tsx
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
  {MOCK_USERS.map((name) => (
    <View key={name} style={{ flexBasis: '47%', flexGrow: 1 }}>
      <Button ... />
    </View>
  ))}
</View>
```

### 원인
- **Web (Chromium):** `flexBasis: '47%'`는 컨테이너 너비 기준으로 계산 → `gap: 12px`는 아이템 **사이**에만 적용 → 47%×2 + 12px ≈ 100%, 한 줄에 2개 배치됨
- **Android (Yoga):** `gap`을 가용 공간 계산에 **먼저** 반영한 후 `flexBasis` 퍼센트를 계산 → 아이템 크기가 예상과 달라져 한 줄에 1개만 배치되거나 간격이 비정상적으로 됨
- Yoga 엔진과 Web CSS의 `gap` + `flexWrap` + 퍼센트 `flexBasis` 조합에 대한 레이아웃 계산 방식이 다름

### 수정안
```tsx
// Option A: 퍼센트 대신 고정 계산
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
  {MOCK_USERS.map((name) => (
    <View key={name} style={{ width: '47%' }}>
      <Button ... />
    </View>
  ))}
</View>

// Option B: FlatList + numColumns 사용
<FlatList
  data={MOCK_USERS}
  numColumns={2}
  columnWrapperStyle={{ gap: 12 }}
  contentContainerStyle={{ gap: 12 }}
  renderItem={({ item }) => (
    <View style={{ flex: 1 }}>
      <Button ... />
    </View>
  )}
/>
```

---

## ISSUE 3 (HIGH): 방 리스트 세로 마진 미적용 — FlatList 내 `marginBottom` 가상화 문제

**파일:** `src/features/room/components/RoomCard.tsx`, `src/features/room/components/RoomListScreen.tsx`

```tsx
// RoomCard.tsx - Pressable 래퍼
style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, marginBottom: 12 })}

// RoomListScreen.tsx - FlatList
<FlatList
  style={{ flex: 1 }}
  data={rooms}
  renderItem={({ item }) => <RoomCard room={item} onPress={...} />}
  // contentContainerStyle 없음
  // ItemSeparatorComponent 없음
/>
```

### 원인
1. **Android FlatList는 `removeClippedSubviews: true`가 기본값** — 아이템의 margin이 셀 경계를 벗어나면 클리핑되어 마진이 사라지는 것처럼 보임
2. **함수형 스타일 `({ pressed }) => ...`에 포함된 margin** — FlatList의 아이템 재활용(recycling) 과정에서 함수형 스타일 내부의 마진이 정확하게 측정되지 않을 수 있음
3. **`contentContainerStyle` 미설정** — 마지막 아이템의 `marginBottom`이 FlatList 경계에서 잘릴 수 있음

### 수정안
```tsx
// RoomListScreen.tsx
<FlatList
  style={{ flex: 1 }}
  contentContainerStyle={{ paddingBottom: 12 }}
  data={rooms}
  keyExtractor={(item) => item.id}
  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
  renderItem={({ item }) => <RoomCard room={item} onPress={...} />}
/>

// RoomCard.tsx - marginBottom 제거
style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
```

---

## ISSUE 4 (HIGH): `borderStyle: 'dashed'` — Android 렌더링 버그

**파일:**
- `src/features/recognition/components/EmptyMemberCard.tsx`
- `src/features/recognition/components/PhotoUploadScreen.tsx`

```tsx
borderStyle: 'dashed'
```

### 원인
- React Native Android에서 `borderStyle: 'dashed'`는 **알려진 버그** — 실선으로 렌더링되거나 아예 표시되지 않음
- `borderWidth`와 `borderColor`가 명시적으로 설정되어 있어도 Android에서는 불안정
- Fabric (New Architecture)에서 일부 개선되었으나 여전히 불안정

### 수정안
```tsx
// Platform별 분기 처리
import { Platform } from 'react-native';

borderStyle: Platform.OS === 'android' ? 'solid' : 'dashed'

// 또는 react-native-dash 같은 서드파티 라이브러리 사용
```

---

## ISSUE 5 (MEDIUM): `className` vs `style` 우선순위 충돌

**파일:** `src/features/recognition/components/VoteOverlay.tsx`, `src/components/ui/Text.tsx`

```tsx
// VoteOverlay.tsx
<Text className="text-3xl text-gray-400">✕</Text>
<Text className="text-3xl text-white">✓</Text>

// Text.tsx (커스텀 컴포넌트)
const baseColor = variant === 'caption' ? colors.onSurfaceVariant : colors.onSurface;
return <RNText style={[typeScale[token], { color: color ?? baseColor }, style]} {...props} />;
```

### 원인
- 커스텀 `Text` 컴포넌트가 항상 `style` prop으로 기본 색상을 적용
- NativeWind의 `className`으로 전달한 `text-gray-400`, `text-white`는 `style` prop보다 **낮은 우선순위**를 가짐
- Android에서는 `className`이 style 객체로 변환되어 merge되지만, 명시적 `style` prop이 항상 우선
- Web에서도 inline style이 CSS class보다 우선하므로 양쪽 다 문제가 될 수 있음

### 수정안
```tsx
// color prop을 직접 전달
<Text color={colors.gray400} style={{ fontSize: 30 }}>✕</Text>
// 또는 className만 사용하도록 Text 컴포넌트 수정
```

---

## ISSUE 6 (MEDIUM): Edge-to-Edge 모드 + 불완전한 SafeArea 처리

**파일:** `app.json`, `src/components/feedback/Toast.tsx`

```json
// app.json
"android": { "edgeToEdgeEnabled": true }
```

```tsx
// Toast.tsx
style={{ position: 'absolute', bottom: 40, ... }}
```

### 원인
- `edgeToEdgeEnabled: true`는 Android에서 시스템 바(상태바, 네비게이션 바) 뒤까지 콘텐츠를 확장
- `Toast` 컴포넌트의 `bottom: 40`은 고정값으로, Android 네비게이션 바 높이를 고려하지 않음
- `ScreenContainer`는 `SafeAreaView`를 사용하지만, 모달/오버레이/토스트는 SafeArea 밖에서 렌더링될 수 있음

### 수정안
```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
style={{ position: 'absolute', bottom: 40 + insets.bottom, ... }}
```

---

## ISSUE 7 (LOW): NativeWind 미활용 — 거의 모든 스타일이 inline `style`

### 현황
전체 ~30+ 컴포넌트 중 NativeWind `className`을 사용하는 파일은 **3개**뿐:
1. `src/components/layout/KeyboardAvoidingWrapper.tsx` — `className="flex-1"`
2. `src/features/recognition/components/VoteOverlay.tsx` — 여러 className
3. `src/components/ui/Button.tsx` — className prop 수용

### 영향
- NativeWind를 설치했지만 실질적으로 사용하지 않고 있어, 번들 크기만 증가
- inline `style`은 Web CSS와 Yoga 엔진 간의 차이에 더 취약함
- NativeWind의 크로스플랫폼 변환 레이어를 활용하지 못하고 있음

---

## ISSUE 8 (INFO): `Platform.select` 미사용

- 프로젝트 전체에서 스타일링 목적의 `Platform.select()` 사용이 **전무함**
- `elevation.ts`에서 Android shadow 처리만 유일하게 플랫폼 분기
- 위 이슈들에 대한 플랫폼별 fallback이 없음

---

## 이슈 요약 테이블

| 우선순위 | 이슈 | 파일 | 증상 |
|---------|------|------|------|
| CRITICAL | `inset: 0` Web 전용 속성 | RecognitionCard.tsx | 배경 뷰가 0×0으로 축소 |
| HIGH | `gap`+`flexWrap`+`flexBasis:%` | LoginScreen.tsx | 로그인 버튼 그리드 깨짐 |
| HIGH | FlatList 내 marginBottom 클리핑 | RoomCard.tsx, RoomListScreen.tsx | 방 리스트 세로 간격 미적용 |
| HIGH | `borderStyle: 'dashed'` 버그 | EmptyMemberCard.tsx, PhotoUploadScreen.tsx | 점선이 실선으로 표시 |
| MEDIUM | className vs style 우선순위 | VoteOverlay.tsx + Text.tsx | 텍스트 색상 미적용 |
| MEDIUM | Edge-to-Edge + SafeArea 미처리 | Toast.tsx | 토스트가 네비게이션 바 뒤로 숨김 |
| LOW | NativeWind 거의 미사용 | 전체 프로젝트 | 번들 크기 낭비 |
| INFO | Platform.select 미사용 | 전체 프로젝트 | 플랫폼별 대응 부재 |

---

## 결론

**근본 원인:** 프로젝트가 Web CSS와 React Native Yoga 엔진의 차이를 고려하지 않고, Web에서만 동작하는 CSS 패턴(inset, gap+flexWrap+%, FlatList margin 등)을 사용하고 있습니다. NativeWind를 설치했으나 거의 활용하지 않아, NativeWind가 제공하는 크로스플랫폼 호환성 이점도 누리지 못하고 있습니다.

**권장 조치:**
1. CRITICAL/HIGH 이슈 4건 즉시 수정
2. 향후 컴포넌트 작성 시 inline `style` 대신 NativeWind `className` 활용 고려
3. Android 에뮬레이터에서 주기적 테스트 병행
