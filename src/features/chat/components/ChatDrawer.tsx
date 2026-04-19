import { elevation, motion, useTheme } from '@/design';
import type { RoomMember } from '@/src/features/room/types/room.types';
import { useEffect } from 'react';
import { BackHandler, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  ReduceMotion,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ChatScreen } from './ChatScreen';

type Props = {
  rendered: boolean;
  progress: SharedValue<number>;
  onClose: () => void;
  roomId: string;
  roomName: string;
  members: RoomMember[];
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const CLOSE_TRANSLATE_THRESHOLD = 80;
const CLOSE_VELOCITY_THRESHOLD = 500;

/**
 * 우측에서 슬라이드되는 채팅 풀스크린 드로어.
 * - ProfileDrawer와 동일한 패턴: 부모가 progress shared value 소유, rendered로 mount 제어.
 * - 손가락을 따라 슬라이드되도록 부모 스와이프 제스처가 직접 progress를 갱신.
 */
export function ChatDrawer({
  rendered,
  progress,
  onClose,
  roomId,
  roomName,
  members,
}: Props) {
  const { colors } = useTheme();

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [SCREEN_WIDTH, 0]) },
    ],
  }));

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.32]),
  }));

  // 좌→우 스와이프로 닫기 (헤더 영역에만 부착)
  const closeGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      const next = Math.min(1, Math.max(0, 1 - e.translationX / SCREEN_WIDTH));
      progress.value = next;
    })
    .onEnd((e) => {
      if (
        e.translationX > CLOSE_TRANSLATE_THRESHOLD ||
        e.velocityX > CLOSE_VELOCITY_THRESHOLD
      ) {
        runOnJS(onClose)();
      } else {
        progress.value = withSpring(1, {
          ...motion.spatialDefault,
          reduceMotion: ReduceMotion.Never,
        });
      }
    });

  // Android 하드웨어 백 버튼으로 닫기
  useEffect(() => {
    if (!rendered) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [rendered, onClose]);

  if (!rendered) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
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

      {/* 드로어 본체 (풀스크린) */}
      <Animated.View
        accessibilityViewIsModal
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: SCREEN_WIDTH,
            backgroundColor: colors.surface,
            ...elevation(2),
          },
          drawerStyle,
        ]}
      >
        {/* 헤더 영역에 닫기 제스처 부착 (MessageList 가로 충돌 방지) */}
        <GestureDetector gesture={closeGesture}>
          <View style={{ flex: 1 }}>
            <ChatScreen
              roomId={roomId}
              roomName={roomName}
              members={members}
              onBack={onClose}
            />
          </View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
}
