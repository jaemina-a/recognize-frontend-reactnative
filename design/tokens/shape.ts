// Material Design 3 Shape tokens
// https://m3.material.io/styles/shape/shape-scale-tokens

export const shape = {
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 28,
  full: 9999,
} as const;

export type ShapeToken = keyof typeof shape;
