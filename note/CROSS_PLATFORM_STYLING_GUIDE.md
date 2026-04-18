# React Native 크로스플랫폼 스타일링 가이드

> **목적**: 이 프로젝트는 **iOS와 Android에 동시 배포**될 예정입니다. Web에서만 동작하는 CSS 패턴이나, 한쪽 플랫폼에서만 깨지는 스타일을 사전에 방지하기 위한 필수 참고 문서입니다.
> **선행 문서**: [`docs/WEB_VS_ANDROID_STYLE_ANALYSIS.md`](../docs/WEB_VS_ANDROID_STYLE_ANALYSIS.md) — 실제 발견된 이슈 사례

---

## 핵심 원칙 (TL;DR)

1. **`Pressable`의 function-style과 `react-native-css-interop` 충돌.** NativeWind v4의 interop이 `({pressed}) => style`을 빈 객체로 변환하는 버그가 있다. **function-style을 쓰는 모든 Pressable에 `cssInterop={false}` 필수.**
2. **React Native는 Web이 아니다.** Yoga 레이아웃 엔진은 Web CSS의 부분집합만 구현한다.
3. **`as any`로 TypeScript 에러를 회피하지 마라.** RN에 없는 속성을 쓰고 있다는 신호다.
4. **Web에서 잘 동작해도 안전하지 않다.** 반드시 **Android 에뮬레이터에서 실제로 검증**한다.
5. **NativeWind `className`을 사용할 때는 `style` prop과 혼용 주의** — interop 레이어가 두 가지를 다르게 처리한다.

---

## 절대 사용 금지 (Web 전용 / RN 미지원)

| 속성/패턴 | 이유 | 대체 방법 |
|---------|------|----------|
| `inset: 0` | Yoga 미지원 단축 속성 | `top: 0, right: 0, bottom: 0, left: 0` 명시 |
| `display: 'grid'` | RN 미지원 | `flexDirection` + `flexWrap` 또는 `FlatList numColumns` |
| `display: 'inline'`, `'inline-block'` | RN 미지원 | `<Text>` 컴포넌트 안에 자식 `<Text>`로 inline 처리 |
| `<div>`, `<span>`, `<p>` 등 HTML 태그 | RN 미지원 | `<View>`, `<Text>`, `<Pressable>` 사용 |
| `hover:`, `focus-visible:` 등 Web 의사클래스 | 터치 환경 무의미 | `Pressable`의 `({ pressed }) => ...` 사용 |
| `cursor: 'pointer'` | Web 전용 | `Pressable` 자체가 터치 피드백 제공 |
| `box-shadow` 문자열 | RN 미지원 | iOS: `shadowColor/Offset/Opacity/Radius`, Android: `elevation` |
| `transition`, `animation` CSS keyframes | RN 미지원 | `Animated`, `react-native-reanimated`, `LayoutAnimation` |
| `space-y-*`, `space-x-*` (Tailwind/NativeWind) | `> * + *` selector 사용으로 RN에서 무효 | `gap` 사용 또는 `marginBottom` 직접 지정 |
| `borderRadius: 9999` (또는 매우 큰 값) | Android Fabric에서 일부 환경 렌더링 누락 | `borderRadius: minHeight / 2` 정확한 반지름 사용 |
| `Pressable`의 function-as-style 안에 시각 속성 (bg/border/radius) | Android Fabric + NativeWind 조합에서 누락 사례 | 정적 스타일은 `StyleSheet.create`로, 함수 스타일에는 `opacity`만 |
| `100vw`, `100vh`, `rem`, `em`, `vmin` 등 단위 | RN 미지원 | `Dimensions.get('window')` 또는 퍼센트, 숫자(dp) |
| `calc(...)` | RN 미지원 | JS로 직접 계산 |
| `position: 'fixed'`, `'sticky'` | RN 미지원 | `position: 'absolute'` + `FlatList stickyHeaderIndices` |
| CSS Variables (`var(--xxx)`) | NativeWind 외 미지원 | 디자인 토큰을 JS 객체로 import |
| `filter`, `backdrop-filter` | 매우 제한적 | `react-native-blur` 등 라이브러리 |
| 형광/그라데이션 색상 (`linear-gradient` 문자열) | RN 미지원 | `expo-linear-gradient` 사용 |

---

## 플랫폼별 차이 — 반드시 분기 처리

### 1. Shadow / Elevation
```tsx
// ❌ 한쪽만 동작
style={{ shadowColor: '#000', shadowOpacity: 0.2 }}  // Android에서 무시
style={{ elevation: 4 }}                              // iOS에서 무시

// ✅ 양쪽 모두 처리
import { Platform } from 'react-native';
style={Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  android: { elevation: 4 },
})}
// 또는 프로젝트 전용 elevation 토큰 사용 (design/tokens/elevation.ts)
```

### 2. `borderStyle: 'dashed' | 'dotted'`
```tsx
// ❌ Android에서 실선으로 표시되거나 사라짐 (특히 borderRadius와 함께 사용 시)
style={{ borderStyle: 'dashed', borderRadius: 16 }}

// ✅ 옵션 1: 평면 사각형이면 borderRadius 없이 사용
style={{ borderStyle: 'dashed', borderWidth: 2, borderColor: '#ccc' }}

// ✅ 옵션 2: rounded dashed가 필요하면 SVG (react-native-svg) Rect의 strokeDasharray 사용
//          또는 react-native-dash-view 같은 전용 라이브러리

// ✅ 옵션 3: Platform 분기로 Android는 solid fallback
borderStyle: Platform.OS === 'android' ? 'solid' : 'dashed'
```

### 3. `gap` + `flexWrap` + 퍼센트 `flexBasis`
```tsx
// ❌ Web과 Android에서 다르게 계산됨
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
  <View style={{ flexBasis: '47%', flexGrow: 1 }}>...</View>
</View>

// ✅ 옵션 1: 명시적 width 사용 (gap 없이 marginRight 사용)
const ITEM_GAP = 12;
<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
  {items.map((item, i) => (
    <View key={item.id} style={{
      width: `${(100 - 2) / 2}%`,  // 49%
      marginLeft: i % 2 === 0 ? 0 : '2%',
      marginBottom: ITEM_GAP,
    }}>...</View>
  ))}
</View>

// ✅ 옵션 2: FlatList numColumns (그리드는 항상 이게 안전)
<FlatList
  data={items}
  numColumns={2}
  columnWrapperStyle={{ gap: 12 }}
  contentContainerStyle={{ gap: 12 }}
  renderItem={({ item }) => <View style={{ flex: 1 }}>...</View>}
/>
```

### 4. `gap` 단독 사용 (단일 행/열)
- RN 0.71+ 에서 `gap`은 지원됨. **단일 방향 flex**에서는 양쪽 플랫폼 OK.
- 단, **flexWrap과 결합하면 위 3번 케이스와 같이 차이 발생** 가능.

### 5. Edge-to-Edge & SafeArea
- `app.json`에 `"edgeToEdgeEnabled": true`가 있으면 Android는 시스템 바 뒤까지 콘텐츠가 들어감.
- 화면 진입점은 반드시 `ScreenContainer` (`SafeAreaView`) 사용.
- **모달/오버레이/Toast/BottomSheet** 같은 absolute 포지셔닝은 반드시 `useSafeAreaInsets()`로 보정:
```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const insets = useSafeAreaInsets();
style={{ position: 'absolute', bottom: 40 + insets.bottom, ... }}
```

### 6. Keyboard 동작
- iOS: `KeyboardAvoidingView behavior="padding"`
- Android: `behavior="height"` 또는 AndroidManifest의 `windowSoftInputMode` 의존
- 항상 `Platform.select`로 분기, 또는 `KeyboardAvoidingWrapper` 같은 공용 컴포넌트 사용.

### 7. Status Bar
- iOS: `StatusBar` 컴포넌트로 색/스타일 제어
- Android: `StatusBar.setBackgroundColor()` 추가 필요 (iOS는 무시됨)

### 8. Font
- iOS는 시스템 폰트 fallback이 우아하지만 Android는 폰트가 없으면 무시됨.
- 커스텀 폰트는 `expo-font`로 명시적 로드, `fontFamily`는 정확한 이름 사용.
- `fontWeight: '700'`은 Android에서 폰트가 weight variant를 가지지 않으면 무시됨 → 별도 폰트 파일 필요.

---

## FlatList / ScrollView 가상화 함정

### 아이템 마진은 `ItemSeparatorComponent`로
```tsx
// ❌ Android에서 removeClippedSubviews=true가 기본값이라 마진이 클리핑될 수 있음
<FlatList
  renderItem={({ item }) => (
    <View style={{ marginBottom: 12 }}>...</View>
  )}
/>

// ✅ 권장: ItemSeparatorComponent로 분리
<FlatList
  contentContainerStyle={{ paddingBottom: 12 }}
  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
  renderItem={({ item }) => <View>...</View>}
/>
```

### 마지막 아이템 잘림 방지
- 항상 `contentContainerStyle={{ paddingBottom: N }}` 추가.

### Pressable 함수형 스타일 + margin 금지
```tsx
// ❌ 함수형 스타일 안에 margin이 있으면 FlatList 재활용 시 측정 누락 가능
style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, marginBottom: 12 })}

// ✅ margin은 외부 wrapper나 ItemSeparator로
style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
```

---

## NativeWind 사용 규칙

### 1. `className`을 받는 컴포넌트 작성 시 — `style` 우선순위 충돌 주의
커스텀 컴포넌트가 내부에서 `style={{ color: ... }}`를 항상 적용하면, 외부에서 `className="text-white"`를 줘도 무시됨 (RN에서 inline style이 우선).

```tsx
// ❌ 외부 className으로 색을 못 바꿈
function Text({ color, style, ...props }) {
  return <RNText style={[{ color: color ?? defaultColor }, style]} {...props} />;
}

// ✅ color prop이 명시되지 않으면 className에 위임
function Text({ color, style, ...props }) {
  // color 미지정 시 인라인 color를 넣지 않아 className이 적용됨
  const inlineStyle = color ? { color } : null;
  return <RNText style={[inlineStyle, style]} {...props} />;
}
```

### 2. 사용 우선순위
1. NativeWind `className` (Tailwind 유틸) — 단순 레이아웃/색/spacing에 우선
2. `StyleSheet.create({...})` — 재사용 가능하고 정적 스타일
3. inline `style={{...}}` — 동적/조건부 스타일에만

### 3. NativeWind에서 피해야 할 클래스
- `space-x-*`, `space-y-*` → RN에서 동작 안 함. `gap-*` 사용 (단, 위 `gap` 주의사항 참고)
- `hover:`, `focus:`, `peer-*` → 터치 환경 무의미
- `backdrop-blur-*` → 별도 라이브러리 필요

---

## 이미지 / 미디어

- **`<Image>` 대신 `expo-image`** 사용 (캐싱, 성능, 크로스플랫폼 일관성)
- `resizeMode`(RN) 대신 `contentFit`(expo-image) 사용
- 원격 이미지는 반드시 `width`, `height` 명시 (Android는 0×0으로 렌더링 가능)

---

## 터치 영역

- 최소 터치 영역은 **44×44 dp** (Apple HIG) / **48×48 dp** (Material) → **48px 이상 권장**
- `IconButton`, `Pressable` 모두 `hitSlop` 활용:
```tsx
<Pressable hitSlop={8}>
```

---

## 색상 / Opacity

- **`rgba()` 문자열은 양쪽 OK** — 권장 (예: `rgba(0,0,0,0.4)`)
- Tailwind의 `bg-black/40` 같은 alpha 단축도 NativeWind에서 OK
- 단색 + `opacity` prop은 **자식까지 영향** → 의도한 것인지 확인

---

## 텍스트 렌더링

### 1. 모든 문자열은 `<Text>` 안에서만
```tsx
// ❌ Android에서 RN 0.81+ 에서도 unstable
<View>{string}</View>

// ✅
<View><Text>{string}</Text></View>
```

### 2. `numberOfLines`로 truncation
```tsx
<Text numberOfLines={1} ellipsizeMode="tail">{longText}</Text>
```

### 3. 텍스트 가운데 정렬
- `textAlign: 'center'` (Text의 style)
- 부모 View의 `alignItems: 'center'`는 **수평 정렬에 영향 없음** (cross axis용)

---

## 개발 워크플로우 체크리스트

새 컴포넌트/화면을 작성할 때:

- [ ] inline style에 `inset`, `display: 'grid'` 등 Web 전용 속성이 없는가?
- [ ] `as any`로 타입 회피한 곳이 없는가?
- [ ] FlatList 사용 시 `ItemSeparatorComponent`, `contentContainerStyle.paddingBottom` 설정?
- [ ] Shadow는 iOS/Android 모두 처리되었는가? (또는 `elevation` 토큰 사용)
- [ ] `borderStyle: 'dashed'`를 borderRadius와 함께 쓰지 않았는가?
- [ ] absolute 포지셔닝 모달/Toast/오버레이는 `useSafeAreaInsets`로 보정?
- [ ] 그리드 레이아웃은 `numColumns` 또는 명시적 width 사용? (gap+flexWrap+% 회피)
- [ ] 모든 문자열이 `<Text>` 안에 있는가?
- [ ] 터치 영역이 48dp 이상인가?
- [ ] **Android 에뮬레이터에서 실제 렌더링 확인 완료?** (iOS는 보통 Yoga 일관, Android가 까다로움)

---

## 디버깅 팁

### Android에서만 깨질 때
1. `npx react-native log-android` 또는 `adb logcat`에서 Yoga 경고 확인
2. **React DevTools** 또는 **Flipper**로 실제 적용된 style 확인
3. `borderColor: 'red'` 등으로 임시 시각화하여 레이아웃 경계 확인
4. `console.log(Dimensions.get('window'))`로 실제 디바이스 크기 확인

### Web에서는 잘 보이는데 Android에서 깨질 때
→ 거의 확실히 위 "절대 사용 금지" 항목 중 하나. 컴포넌트의 모든 inline style을 검토.

---

## 신규 코드 작성 흐름

1. UI 디자인 → 어떤 RN primitive 사용할지 결정 (`View`, `Text`, `Pressable`, `FlatList`, etc.)
2. 정적 스타일은 `StyleSheet.create` 또는 NativeWind `className`으로
3. 동적 스타일만 inline `style={{...}}`로
4. **개발 중 항상 Android 에뮬레이터로 1차 확인** (Web에서만 보지 말 것)
5. iOS 시뮬레이터는 macOS 환경 확보 후 보조 확인
6. PR 전 위 체크리스트 점검

---

## 참고 자료

- React Native 공식 Layout: https://reactnative.dev/docs/flexbox
- Yoga 엔진 차이: https://yogalayout.com/
- NativeWind: https://www.nativewind.dev/
- Platform 분기: https://reactnative.dev/docs/platform-specific-code
