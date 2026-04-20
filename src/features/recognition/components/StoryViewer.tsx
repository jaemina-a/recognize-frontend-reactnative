import { Text } from '@/src/components/ui';
import { CONFIG } from '@/src/constants/config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recognitionApi } from '../api/recognitionApi';
import { useStoryViewerStore } from '../stores/storyViewerStore';
import type { Recognition } from '../types/recognition.types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function formatHeader(date: string, uploadedAt: string): string {
  const [, m, d] = date.split('-').map(Number);
  const t = new Date(uploadedAt);
  const hh = String(t.getHours()).padStart(2, '0');
  const mm = String(t.getMinutes()).padStart(2, '0');
  return `${m}월 ${d}일 · ${hh}:${mm}`;
}

export function StoryViewer() {
  const { visible, roomId, date, initialIndex, close } = useStoryViewerStore();
  const [photos, setPhotos] = useState<Recognition[] | null>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const listRef = useRef<FlatList<Recognition>>(null);
  const insets = useSafeAreaInsets();

  const dragY = useSharedValue(0);

  const setIdx = (i: number) => {
    indexRef.current = i;
    setIndex(i);
  };

  useEffect(() => {
    if (!visible || !roomId || !date) return;
    let cancelled = false;
    setPhotos(null);
    setIdx(initialIndex);
    dragY.value = 0;
    recognitionApi
      .getPhotosByDate(roomId, date)
      .then((data) => {
        if (cancelled) return;
        setPhotos(data);
      })
      .catch(() => {
        if (cancelled) return;
        setPhotos([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, roomId, date, initialIndex]);

  useEffect(() => {
    if (photos && photos.length > 0 && initialIndex > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({
          offset: initialIndex * SCREEN_W,
          animated: false,
        });
      });
    }
  }, [photos, initialIndex]);

  const current = photos?.[index] ?? null;

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (i !== indexRef.current) setIdx(i);
  };

  const goPrev = () => {
    if (!photos) return;
    const cur = indexRef.current;
    if (cur <= 0) return;
    const next = cur - 1;
    setIdx(next);
    listRef.current?.scrollToOffset({ offset: next * SCREEN_W, animated: true });
  };

  const goNext = () => {
    if (!photos) return;
    const cur = indexRef.current;
    if (cur >= photos.length - 1) return;
    const next = cur + 1;
    setIdx(next);
    listRef.current?.scrollToOffset({ offset: next * SCREEN_W, animated: true });
  };

  const dismissPan = Gesture.Pan()
    .activeOffsetY(15)
    .failOffsetX([-20, 20])
    .onUpdate((e) => {
      dragY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      const shouldClose = e.translationY > 120 || e.velocityY > 800;
      if (shouldClose) {
        dragY.value = withTiming(SCREEN_H, { duration: 180 }, (finished) => {
          if (finished) runOnJS(close)();
        });
      } else {
        dragY.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, dragY.value / (SCREEN_H * 0.6)),
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
      presentationStyle="overFullScreen"
      transparent
    >
      <StatusBar barStyle="light-content" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, backdropStyle]}
        />
        <GestureDetector gesture={dismissPan}>
          <Animated.View style={[{ flex: 1 }, containerStyle]}>
            {photos === null ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : photos.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 32,
                }}
              >
                <Text variant="bodyLarge" style={{ color: '#fff', textAlign: 'center' }}>
                  이 날엔 올라온 사진이 없어요.
                </Text>
                <Pressable
                  onPress={close}
                  style={{ marginTop: 24, padding: 12 }}
                  accessibilityRole="button"
                >
                  <Text variant="labelLarge" style={{ color: '#fff' }}>
                    닫기
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                <FlatList
                  ref={listRef}
                  data={photos}
                  keyExtractor={(p) => p.id}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={onMomentumEnd}
                  getItemLayout={(_, i) => ({
                    length: SCREEN_W,
                    offset: SCREEN_W * i,
                    index: i,
                  })}
                  initialScrollIndex={initialIndex}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        width: SCREEN_W,
                        height: SCREEN_H,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Image
                        source={{ uri: `${CONFIG.API_URL}/${item.photoUrl}` }}
                        style={{ width: SCREEN_W, height: SCREEN_H }}
                        contentFit="contain"
                        transition={200}
                      />
                      {/* Tap zones inside slide so FlatList can still own pan */}
                      <View
                        pointerEvents="box-none"
                        style={{
                          position: 'absolute',
                          top: insets.top + 60,
                          bottom: insets.bottom + 24,
                          left: 0,
                          right: 0,
                          flexDirection: 'row',
                        }}
                      >
                        <Pressable
                          onPress={goPrev}
                          accessibilityRole="button"
                          accessibilityLabel="이전 사진"
                          style={{ flex: 1 }}
                        />
                        <Pressable
                          onPress={goNext}
                          accessibilityRole="button"
                          accessibilityLabel="다음 사진"
                          style={{ flex: 1 }}
                        />
                      </View>
                    </View>
                  )}
                />

                {/* Top overlay */}
                <View
                  pointerEvents="box-none"
                  style={{
                    position: 'absolute',
                    top: insets.top + 8,
                    left: 0,
                    right: 0,
                    paddingHorizontal: 16,
                    zIndex: 30,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    {photos.map((_, i) => (
                      <View
                        key={i}
                        style={{
                          flex: 1,
                          height: 2,
                          borderRadius: 1,
                          backgroundColor:
                            i === index
                              ? 'rgba(255,255,255,0.95)'
                              : 'rgba(255,255,255,0.3)',
                          marginHorizontal: 2,
                        }}
                      />
                    ))}
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {current ? (
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                      >
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: current.uploaderColor,
                            marginRight: 8,
                          }}
                        />
                        <Text
                          variant="labelLarge"
                          style={{ color: '#fff', marginRight: 8 }}
                        >
                          {current.uploaderNickname}
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          {date ? formatHeader(date, current.uploadedAt) : ''}
                        </Text>
                      </View>
                    ) : (
                      <View style={{ flex: 1 }} />
                    )}
                    <Pressable
                      onPress={close}
                      hitSlop={16}
                      accessibilityRole="button"
                      accessibilityLabel="닫기"
                      style={({ pressed }) => ({
                        padding: 6,
                        opacity: pressed ? 0.6 : 1,
                      })}
                    >
                      <MaterialCommunityIcons name="close" size={26} color="#fff" />
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}
