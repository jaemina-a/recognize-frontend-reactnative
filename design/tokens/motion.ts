// Material Design 3 Motion tokens
// Spring configs for react-native-reanimated
// https://m3.material.io/styles/motion/overview

export const motion = {
  // Spatial springs — for layout, size, position changes
  spatialFast: { damping: 20, stiffness: 400, mass: 1 },
  spatialDefault: { damping: 22, stiffness: 200, mass: 1 },
  spatialSlow: { damping: 24, stiffness: 120, mass: 1 },

  // Effects springs — for opacity, color, non-spatial properties
  effectsFast: { damping: 20, stiffness: 800, mass: 1 },
  effectsDefault: { damping: 22, stiffness: 400, mass: 1 },
  effectsSlow: { damping: 24, stiffness: 200, mass: 1 },
} as const;

// Duration tokens (fallback for Animated API / LayoutAnimation)
export const duration = {
  short1: 50,
  short2: 100,
  short3: 150,
  short4: 200,
  medium1: 250,
  medium2: 300,
  medium3: 350,
  medium4: 400,
  long1: 450,
  long2: 500,
  long3: 550,
  long4: 600,
} as const;
