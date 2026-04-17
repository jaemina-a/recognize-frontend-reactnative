// Material Design 3 Elevation tokens (iOS/Android cross-platform)
// Approximation via shadow + elevation
import { Platform } from 'react-native';

export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

type ElevationStyle = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

const IOS_ELEVATIONS: Record<ElevationLevel, ElevationStyle> = {
  0: { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  1: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2, elevation: 1 },
  2: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.14, shadowRadius: 4, elevation: 2 },
  3: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 8, elevation: 3 },
  4: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 4 },
  5: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 5 },
};

export function elevation(level: ElevationLevel): ElevationStyle {
  if (Platform.OS === 'android') {
    return { ...IOS_ELEVATIONS[level], shadowOpacity: 0 };
  }
  return IOS_ELEVATIONS[level];
}
