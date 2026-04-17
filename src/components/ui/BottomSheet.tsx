import { duration, elevation, motion, shape, useTheme } from '@/design';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const { colors } = useTheme();
  const [rendered, setRendered] = useState(false);
  const translateY = useSharedValue(800);
  const scrimOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      translateY.value = withSpring(0, motion.spatialDefault);
      scrimOpacity.value = withTiming(0.32, { duration: duration.medium2 });
    } else {
      scrimOpacity.value = withTiming(0, { duration: duration.short4 });
      translateY.value = withSpring(800, motion.spatialFast, (finished) => {
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
              accessibilityLabel="닫기"
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
            {/* Drag handle */}
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

            {children}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
