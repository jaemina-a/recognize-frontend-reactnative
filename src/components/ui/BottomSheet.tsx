import { duration, elevation, motion, shape, useTheme } from '@/design';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
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
  /** Show top "Cancel" text + centered title header */
  showCancelHeader?: boolean;
  /** Centered title shown when showCancelHeader is true */
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
      translateY.value = withSpring(0, motion.spatialDefault);
      scrimOpacity.value = withTiming(0.32, { duration: duration.medium2 });
    } else {
      scrimOpacity.value = withTiming(0, { duration: duration.short4 });
      translateY.value = withSpring(HIDDEN_OFFSET, motion.spatialFast, (finished) => {
        if (finished) runOnJS(setRendered)(false);
      });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: scrimOpacity.value,
  }));

  // Drag the handle to follow the sheet; close when threshold exceeded.
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
        translateY.value = withSpring(0, motion.spatialDefault);
      }
    });

  if (!rendered) return null;

  return (
    <Modal
      transparent
      visible={rendered}
      onRequestClose={onClose}
      statusBarTranslucent
      animationType="none"
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {/* Scrim */}
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

          {/* Sheet */}
          <Animated.View
            accessibilityViewIsModal
            style={[
              {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: colors.surfaceContainerHigh,
                borderTopLeftRadius: shape.extraLarge,
                borderTopRightRadius: shape.extraLarge,
                ...elevation(3),
              },
              sheetStyle,
            ]}
          >
            {/* Drag handle area only - avoids conflict with inner ScrollView/inputs */}
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
                {/* Right-side spacer to balance the left "Cancel" */}
                <View style={{ width: 36 }} />
              </View>
            ) : null}

            {children}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
