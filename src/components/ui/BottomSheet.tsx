import { duration, elevation, motion, shape, useTheme } from '@/design';
import { useEffect, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from './Text';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showCancelHeader?: boolean;
  title?: string;
};

const CLOSE_TRANSLATE_THRESHOLD = 120;
const CLOSE_VELOCITY_THRESHOLD = 800;
const HIDDEN_OFFSET = 800;

export function BottomSheet({
  visible,
  onClose,
  children,
  showCancelHeader = false,
  title,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const [rendered, setRendered] = useState(false);
  const translateY = useSharedValue(HIDDEN_OFFSET);
  const scrimOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      translateY.value = withSpring(0, { ...motion.spatialDefault, reduceMotion: ReduceMotion.Never });
      scrimOpacity.value = withTiming(0.32, { duration: duration.medium2, reduceMotion: ReduceMotion.Never });
    } else if (rendered) {
      scrimOpacity.value = withTiming(0, { duration: duration.short4, reduceMotion: ReduceMotion.Never });
      translateY.value = withSpring(HIDDEN_OFFSET, { ...motion.spatialFast, reduceMotion: ReduceMotion.Never }, (finished) => {
        if (finished) runOnJS(setRendered)(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!rendered) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [rendered, onClose]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: scrimOpacity.value,
  }));

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_TRANSLATE_THRESHOLD || e.velocityY > CLOSE_VELOCITY_THRESHOLD) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { ...motion.spatialDefault, reduceMotion: ReduceMotion.Never });
      }
    });

  if (!rendered) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, scrimStyle]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close"
          accessibilityRole="button"
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
        pointerEvents="box-none"
      >
        <Animated.View
          accessibilityViewIsModal
          style={[
            {
              backgroundColor: colors.surfaceContainerHigh,
              borderTopLeftRadius: shape.extraLarge,
              borderTopRightRadius: shape.extraLarge,
              ...elevation(3),
            },
            sheetStyle,
          ]}
        >
          <GestureDetector gesture={dragGesture}>
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <View
                style={{
                  width: 32,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.onSurfaceVariant,
                  opacity: 0.4,
                }}
              />
            </View>
          </GestureDetector>

          {showCancelHeader ? (
            <View
              style={{
                height: 48,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
              }}
            >
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="취소"
                cssInterop={false}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Text variant="bodyLarge" color={colors.onSurface}>
                  취소
                </Text>
              </Pressable>
              <View style={{ flex: 1, alignItems: 'center' }}>
                {title ? (
                  <Text variant="titleMedium" color={colors.onSurface}>
                    {title}
                  </Text>
                ) : null}
              </View>
              <View style={{ width: 36 }} />
            </View>
          ) : null}

          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
