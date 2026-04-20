import { motion } from '@/design';
import { ScreenContainer } from '@/src/components/layout';
import { Button } from '@/src/components/ui';
import { ChatDrawer } from '@/src/features/chat/components';
import { CalendarBottomSheet } from '@/src/features/recognition/components/CalendarBottomSheet';
import { RecognitionFeed } from '@/src/features/recognition/components/RecognitionFeed';
import { RoomStoryFeed } from '@/src/features/recognition/components/RoomStoryFeed';
import { RoomHeader } from '@/src/features/room/components/RoomHeader';
import { SettingsBottomSheet } from '@/src/features/room/components/SettingsBottomSheet';
import { useRoom } from '@/src/features/room/hooks/useRoom';
import { useRoomPreferencesStore } from '@/src/stores/roomPreferencesStore';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  ReduceMotion,
  runOnJS,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const OPEN_VELOCITY_THRESHOLD = 500;

export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { room, refetch: refetchRoom } = useRoom(id);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const feedMode = useRoomPreferencesStore(
    (s) => s.prefsByRoom[id]?.feedMode ?? 'vertical',
  );

  const [chatRendered, setChatRendered] = useState(false);
  const chatProgress = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      refetchRoom();
    }, [refetchRoom]),
  );

  const setRendered = useCallback((v: boolean) => setChatRendered(v), []);

  const openChat = useCallback(() => {
    setChatRendered(true);
    chatProgress.value = withSpring(1, {
      ...motion.spatialDefault,
      reduceMotion: ReduceMotion.Never,
    });
  }, [chatProgress]);

  const closeChat = useCallback(() => {
    chatProgress.value = withSpring(
      0,
      { ...motion.spatialFast, reduceMotion: ReduceMotion.Never },
      (finished) => {
        if (finished) runOnJS(setRendered)(false);
      },
    );
  }, [chatProgress, setRendered]);

  const swipeToChat = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onStart(() => {
      runOnJS(setRendered)(true);
    })
    .onUpdate((e) => {
      const next = Math.min(1, Math.max(0, -e.translationX / SCREEN_WIDTH));
      chatProgress.value = next;
    })
    .onEnd((e) => {
      const shouldOpen =
        -e.translationX > SCREEN_WIDTH * 0.4 || e.velocityX < -OPEN_VELOCITY_THRESHOLD;
      if (shouldOpen) {
        chatProgress.value = withSpring(1, {
          ...motion.spatialDefault,
          reduceMotion: ReduceMotion.Never,
        });
      } else {
        chatProgress.value = withSpring(
          0,
          { ...motion.spatialFast, reduceMotion: ReduceMotion.Never },
          (finished) => {
            if (finished) runOnJS(setRendered)(false);
          },
        );
      }
    });

  return (
    <ScreenContainer>
      <RoomHeader
        roomName={room.name}
        roomId={id}
        onChatPress={openChat}
        onCalendarPress={() => setIsCalendarOpen(true)}
        onSettingsPress={() => setIsSettingsOpen(true)}
      />

      <GestureDetector gesture={swipeToChat}>
        <View style={{ flex: 1 }}>
          {feedMode === 'story' ? (
            <RoomStoryFeed roomId={id} members={room.members} />
          ) : (
            <RecognitionFeed roomId={id} members={room.members} />
          )}

          <View style={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 }}>
            <Button
              title="인증하기"
              size="lg"
              onPress={() => router.push(`/room/${id}/upload` as any)}
            />
          </View>
        </View>
      </GestureDetector>

      <CalendarBottomSheet
        visible={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        roomId={id}
        members={room.members}
      />

      <SettingsBottomSheet
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        roomId={id}
        inviteCode={room.inviteCode}
        members={room.members}
      />

      <ChatDrawer
        rendered={chatRendered}
        progress={chatProgress}
        onClose={closeChat}
        roomId={id}
        roomName={room.name}
        members={room.members}
      />
    </ScreenContainer>
  );
}
