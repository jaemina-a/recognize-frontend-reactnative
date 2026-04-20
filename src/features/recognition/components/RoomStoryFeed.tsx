import { Text } from '@/src/components/ui';
import { CONFIG } from '@/src/constants/config';
import type { RoomMember } from '@/src/features/room/types/room.types';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  Pressable,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useRecognitionFeed } from '../hooks/useRecognitionFeed';
import type { Recognition } from '../types/recognition.types';
import { EmptyFeed } from './EmptyFeed';

type RoomStoryFeedProps = {
  roomId: string;
  members?: RoomMember[];
};

function formatTime(uploadedAt: string): string {
  const t = new Date(uploadedAt);
  const hh = String(t.getHours()).padStart(2, '0');
  const mm = String(t.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function RoomStoryFeed({ roomId }: RoomStoryFeedProps) {
  const { feed, refetch } = useRecognitionFeed(roomId);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const listRef = useRef<FlatList<Recognition>>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const setIdx = (i: number) => {
    indexRef.current = i;
    setIndex(i);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) {
      setSize({ w: width, h: height });
    }
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (size.w === 0) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / size.w);
    if (i !== indexRef.current) setIdx(i);
  };

  const goPrev = () => {
    if (size.w === 0) return;
    const cur = indexRef.current;
    if (cur <= 0) return;
    const next = cur - 1;
    setIdx(next);
    listRef.current?.scrollToOffset({ offset: next * size.w, animated: true });
  };

  const goNext = () => {
    if (size.w === 0) return;
    const cur = indexRef.current;
    if (cur >= feed.length - 1) return;
    const next = cur + 1;
    setIdx(next);
    listRef.current?.scrollToOffset({ offset: next * size.w, animated: true });
  };

  if (feed.length === 0) {
    return <EmptyFeed />;
  }

  const current = feed[index];

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }} onLayout={onLayout}>
      {size.w > 0 && (
        <>
          <FlatList
            ref={listRef}
            data={feed}
            keyExtractor={(p) => p.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumEnd}
            getItemLayout={(_, i) => ({
              length: size.w,
              offset: size.w * i,
              index: i,
            })}
            renderItem={({ item }) => (
              <View
                style={{
                  width: size.w,
                  height: size.h,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={{ uri: `${CONFIG.API_URL}/${item.photoUrl}` }}
                  style={{ width: size.w, height: size.h }}
                  contentFit="contain"
                  transition={200}
                />
                {/* Tap zones inside slide so FlatList can still own pan */}
                <View
                  pointerEvents="box-none"
                  style={{
                    position: 'absolute',
                    top: 56,
                    bottom: 0,
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
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 8,
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
              {feed.map((_, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 2,
                    borderRadius: 1,
                    backgroundColor:
                      i === index ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
                    marginHorizontal: 2,
                  }}
                />
              ))}
            </View>

            {current && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: current.uploaderColor,
                    marginRight: 8,
                  }}
                />
                <Text variant="labelLarge" style={{ color: '#fff', marginRight: 8 }}>
                  {current.uploaderNickname}
                </Text>
                <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {formatTime(current.uploadedAt)}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}
