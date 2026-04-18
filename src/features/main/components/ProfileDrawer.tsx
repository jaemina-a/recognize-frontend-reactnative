import { elevation, motion, shape, useTheme } from '@/design';
import { Avatar, Text } from '@/src/components/ui';
import type { User } from '@/src/features/auth/types/auth.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  interpolate,
  ReduceMotion,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type DrawerItem = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type Props = {
  /** 드로어 마운트 여부. 부모가 close 애니메이션 완료 후 false로 전환. */
  rendered: boolean;
  /** 0(닫힘) ~ 1(열림) 슬라이딩 진행도. 부모 소유. */
  progress: SharedValue<number>;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
export const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);
const CLOSE_TRANSLATE_THRESHOLD = 60;
const CLOSE_VELOCITY_THRESHOLD = 500;

/**
 * 좌측 슬라이드 드로어.
 * - `Modal`을 사용하지 않아 mount 지연 없이 첫 프레임부터 자연스럽게 슬라이드.
 * - `progress` sharedValue는 부모가 소유 → 외부 스와이프 제스처와 진행도를 공유 가능.
 */
export function ProfileDrawer({ rendered, progress, onClose, user, onLogout }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [-DRAWER_WIDTH, 0]) },
    ],
  }));

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.32]),
  }));

  // 드로어 우→좌 스와이프로 닫기. 손가락을 따라 progress가 줄어듦.
  const closeGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      const next = Math.min(1, Math.max(0, 1 + e.translationX / DRAWER_WIDTH));
      progress.value = next;
    })
    .onEnd((e) => {
      if (
        e.translationX < -CLOSE_TRANSLATE_THRESHOLD ||
        e.velocityX < -CLOSE_VELOCITY_THRESHOLD
      ) {
        runOnJS(onClose)();
      } else {
        progress.value = withSpring(1, { ...motion.spatialDefault, reduceMotion: ReduceMotion.Never });
      }
    });

  const items: DrawerItem[] = [
    {
      icon: 'logout',
      label: '로그아웃',
      onPress: () => {
        onClose();
        // 닫는 애니메이션 후 로그아웃
        setTimeout(onLogout, 250);
      },
      destructive: true,
    },
  ];

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

      {/* 드로어 본체 */}
      <GestureDetector gesture={closeGesture}>
        <Animated.View
          accessibilityViewIsModal
          style={[
            {
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: DRAWER_WIDTH,
              backgroundColor: colors.surfaceContainerHigh,
              borderTopRightRadius: shape.large,
              borderBottomRightRadius: shape.large,
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 16,
              ...elevation(2),
            },
            drawerStyle,
          ]}
        >
          {/* 헤더: Avatar + 닉네임 */}
          <View style={{ paddingHorizontal: 20 }}>
            <Avatar name={user?.nickname ?? '?'} size={56} />
            <Text
              variant="titleMedium"
              color={colors.onSurface}
              style={{ marginTop: 12, fontWeight: '700' }}
            >
              {user?.nickname ?? '게스트'}
            </Text>
            {user?.id ? (
              <Text
                variant="bodySmall"
                color={colors.onSurfaceVariant}
                style={{ marginTop: 2 }}
              >
                @{user.id}
              </Text>
            ) : null}
          </View>

          {/* Divider */}
          <View
            style={{
              height: StyleSheet.hairlineWidth,
              backgroundColor: colors.outlineVariant,
              marginVertical: 16,
              marginHorizontal: 20,
            }}
          />

          {/* 메뉴 항목 */}
          <View>
            {items.map((item, idx) => {
              const fg = item.destructive ? colors.error : colors.onSurface;
              return (
                <Pressable
                  key={idx}
                  onPress={item.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  cssInterop={false}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 56,
                    paddingHorizontal: 20,
                    backgroundColor: pressed ? colors.surfaceContainerHighest : 'transparent',
                  })}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={fg}
                    style={{ marginRight: 16 }}
                  />
                  <Text variant="bodyLarge" color={fg}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
