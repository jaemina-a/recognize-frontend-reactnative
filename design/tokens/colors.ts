// Material Design 3 Color Scheme
// Source color: #1B6EF3 (Sky Blue — "하늘을 여유있게 바라볼 날이 올것이라는 희망")
// Neutrals: pure achromatic gray (chroma=0, 보라 틴트 없음) — 사진이 포인트가 되도록
// https://m3.material.io/styles/color/roles

export type ColorScheme = {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  outline: string;
  outlineVariant: string;
  scrim: string;
  shadow: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
};

// ─── Primary Tonal Palette (H=217, C=80) ───────────────────────────
// P10:#001944  P20:#002D7A  P30:#0043B2  P40:#1B5EE8
// P80:#A8C8FF  P90:#D6E5FF  P95:#EBF2FF  P99:#FAFCFF

// ─── Secondary Tonal Palette (H=217, C=20) ──────────────────────────
// S10:#0F1B31  S20:#1E3157  S30:#2F4A7E  S40:#4264A5
// S80:#AABFDF  S90:#D0DDEF  S95:#E6EEF8

// ─── Tertiary Tonal Palette (H=190, C=25 — 청록, 하늘+바다) ─────────
// T10:#001F28  T20:#00374A  T30:#00516E  T40:#006C93
// T80:#7ACFEE  T90:#C0E9F7  T95:#E0F4FB

// ─── Neutral Tonal Palette (chroma=0, pure achromatic gray) ─────────
// N0:#000000   N4:#0A0A0A   N6:#0F0F0F   N10:#1A1A1A
// N12:#1F1F1F  N17:#2B2B2B  N20:#333333  N22:#383838
// N24:#3D3D3D  N25:#404040  N30:#4D4D4D  N40:#666666
// N50:#808080  N60:#999999  N70:#B3B3B3  N80:#CCCCCC
// N87:#DEDEDE  N90:#E5E5E5  N92:#EBEBEB  N94:#F0F0F0
// N96:#F5F5F5  N98:#FAFAFA  N99:#FCFCFC  N100:#FFFFFF

// ─── NeutralVariant Tonal Palette (H=217, C=6 — 극미 파란 틴트) ────
// NV10:#161B24 NV20:#2B3040 NV30:#42485B NV40:#596072
// NV50:#737B8E NV60:#8D95A8 NV70:#A8AFC2 NV80:#C4CADD NV90:#E0E4F0

export const lightColorScheme: ColorScheme = {
  // Primary — blue P40
  primary: '#1B5EE8',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D6E5FF',      // P90
  onPrimaryContainer: '#001944',    // P10

  // Secondary — muted blue S40
  secondary: '#4264A5',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D0DDEF',    // S90
  onSecondaryContainer: '#0F1B31',  // S10

  // Tertiary — sky teal T40
  tertiary: '#006C93',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#C0E9F7',     // T90
  onTertiaryContainer: '#001F28',   // T10

  // Error
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',

  // Background & Surface — pure gray N99
  background: '#FCFCFC',            // N99
  onBackground: '#1A1A1A',          // N10
  surface: '#FCFCFC',               // N99
  onSurface: '#1A1A1A',             // N10
  surfaceVariant: '#E0E4F0',        // NV90 (barely-tinted variant)
  onSurfaceVariant: '#42485B',      // NV30

  // Surface containers — pure gray
  surfaceContainerLowest: '#FFFFFF',  // N100
  surfaceContainerLow: '#F5F5F5',     // N96
  surfaceContainer: '#F0F0F0',        // N94
  surfaceContainerHigh: '#EBEBEB',    // N92
  surfaceContainerHighest: '#E5E5E5', // N90

  outline: '#737B8E',               // NV50
  outlineVariant: '#C4CADD',        // NV80

  scrim: '#000000',
  shadow: '#000000',

  inverseSurface: '#333333',        // N20
  inverseOnSurface: '#F5F5F5',      // N96
  inversePrimary: '#A8C8FF',        // P80
};

export const darkColorScheme: ColorScheme = {
  // Primary — blue P80 (밝은 파랑, 검정 배경 위에서 가독성 확보)
  primary: '#A8C8FF',               // P80
  onPrimary: '#002D7A',             // P20
  primaryContainer: '#0043B2',      // P30
  onPrimaryContainer: '#D6E5FF',    // P90

  // Secondary — muted blue S80
  secondary: '#AABFDF',             // S80
  onSecondary: '#1E3157',           // S20
  secondaryContainer: '#2F4A7E',    // S30
  onSecondaryContainer: '#D0DDEF',  // S90

  // Tertiary — sky teal T80
  tertiary: '#7ACFEE',              // T80
  onTertiary: '#00374A',            // T20
  tertiaryContainer: '#00516E',     // T30
  onTertiaryContainer: '#C0E9F7',   // T90

  // Error
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',

  // Background & Surface — true black base (사진이 돋보이도록)
  background: '#0A0A0A',            // N4
  onBackground: '#E5E5E5',          // N90
  surface: '#0A0A0A',               // N4
  onSurface: '#E5E5E5',             // N90
  surfaceVariant: '#2B3040',        // NV20 (극미 파란 틴트로 depth 부여)
  onSurfaceVariant: '#C4CADD',      // NV80

  // Surface containers — 검정에서 단계별 회색 (사진 카드가 떠 보이는 효과)
  surfaceContainerLowest: '#000000',  // N0
  surfaceContainerLow: '#1A1A1A',     // N10
  surfaceContainer: '#1F1F1F',        // N12
  surfaceContainerHigh: '#2B2B2B',    // N17
  surfaceContainerHighest: '#333333', // N20

  outline: '#808080',               // N50 (순수 중간 회색)
  outlineVariant: '#3D3D3D',        // N24 (구분선, 거의 안 보이게)

  scrim: '#000000',
  shadow: '#000000',

  inverseSurface: '#E5E5E5',        // N90
  inverseOnSurface: '#1A1A1A',      // N10
  inversePrimary: '#1B5EE8',        // P40
};

// Legacy palette (backward-compat for any non-themed spots)
export const palette = {
  black: '#000000',
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray500: '#9E9E9E',
  gray700: '#616161',
  gray900: '#212121',
} as const;

export const colors = lightColorScheme;
