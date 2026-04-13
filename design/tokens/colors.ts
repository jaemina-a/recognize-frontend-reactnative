// 와이어프레임용 흑백 색상
// TODO: 디자인 확정 후 실제 브랜드 컬러로 교체

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

// TODO: 시맨틱 컬러 정의 (디자인 확정 후)
export const colors = {
  primary: palette.black,
  background: palette.white,
  surface: palette.gray100,
  textPrimary: palette.black,
  textSecondary: palette.gray700,
  border: palette.gray300,
  divider: palette.gray200,
} as const;
