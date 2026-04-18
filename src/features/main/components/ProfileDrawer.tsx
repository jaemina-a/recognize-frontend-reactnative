import { duration, elevation, motion, shape, useTheme } from '@/design';
import { Avatar, Text } from '@/src/components/ui';
import type { User } from '@/src/features/auth/types/auth.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type DrawerItem = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);
const CLOSE_TRANSLATE_THRESHOLD = 60;
const CLOSE_VELOCITY_THRESHOLD = 500;

/**
 * 좌측 슬라이드 드로어 (X 앱 스타일).
 * - Avatar 탭 또는 화면 좌→우 스와이프로 열림
 * - 스크림 탭 / 우→좌 스와이프 / 안드로이드 백버튼으로 닫힘
 */
export function ProfileDrawer({ visible, onClose, user, onLogout }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [rendered, setRendered] = useState(false);

  // 닫힌 상태: -DRAWER_WIDTH (왼쪽 화면 밖). 열린 상태: 0
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const scrimOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      translateX.value = withSpring(0, motion.spatialDefault);
      scrimOpacity.value = withTiming(0.32, { duration: duration.medium2 });
    } else {
      scrimOpacity.value = withTiming(0, { duration: duration.short4 });
      translateX.value = withSpring(-DRAWER_WIDTH, motion.spatialFast, (finished) => {
        if (finished) runOnJS(setRendered)(false);
      });
    }
  }, [visible]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: scrimOpacity.value,
  }));

  // 드로어 우→좌 스와이프로 닫기. 수평 임계값 설정으로 수직 스크롤은 통과.
  const dragGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (
        e.translationX < -CLOSE_TRANSLATE_THRESHOLD ||
        e.velocityX < -CLOSE_VELOCITY_THRESHOLD
      ) {
        runOnJS(onClose)();
      } else {
        translateX.value = withSpring(0, motion.spatialDefault);
      }
    });

  const items: DrawerItem[] = [
    {
      icon: 'logout',
      label: '로그아웃',
      onPress: () => {
        onClose();
        // 닫는 애니메이션 후 로그아웃 (즉시 호출 시 모달이 unmount되며 깜빡일 수 있음)
        setTimeout(onLogout, duration.short4);
      },
      destructive: true,
    },
  ];

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
        <View style={StyleSheet.absoluteFill}>
          {/* Scrim (탭 시 닫기) */}
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
          <GestureDetector gesture={dragGesture}>
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
      </GestureHandlerRootView>
    </Modal>
  );
}
