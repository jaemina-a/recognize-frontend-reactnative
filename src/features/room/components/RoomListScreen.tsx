import { motion, useTheme } from '@/design';
import { ScreenContainer } from '@/src/components/layout';
import { Avatar, DropdownMenu, IconButton, Text, type DropdownMenuItem } from '@/src/components/ui';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import {
  CreateRoomSheet,
  EmptyRoomActions,
  JoinRoomSheet,
  ProfileDrawer,
} from '@/src/features/main/components';
import { DRAWER_WIDTH } from '@/src/features/main/components/ProfileDrawer';
import { useAuthStore } from '@/src/stores/authStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring, ReduceMotion } from 'react-native-reanimated';
import { useRoomList } from '../hooks/useRoomList';
import { RoomCard } from './RoomCard';

const OPEN_VELOCITY_THRESHOLD = 500;

export function RoomListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { rooms, refetch } = useRoomList();
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);

  const [drawerRendered, setDrawerRendered] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [joinSheetOpen, setJoinSheetOpen] = useState(false);

  const drawerProgress = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const addMenuItems: DropdownMenuItem[] = [
    {
      label: '방 만들기',
      icon: 'home-plus-outline',
      onPress: () => setCreateSheetOpen(true),
    },
    {
      label: '방 참가하기',
      icon: 'ticket-confirmation-outline',
      onPress: () => setJoinSheetOpen(true),
    },
  ];

  const openDrawer = useCallback(() => {
    setDrawerRendered(true);
    drawerProgress.value = withSpring(1, { ...motion.spatialDefault, reduceMotion: ReduceMotion.Never });
  }, [drawerProgress]);

  const closeDrawer = useCallback(() => {
    drawerProgress.value = withSpring(0, { ...motion.spatialFast, reduceMotion: ReduceMotion.Never }, (finished) => {
      if (finished) runOnJS(setDrawerRendered)(false);
    });
  }, [drawerProgress]);

  const setRendered = useCallback((v: boolean) => setDrawerRendered(v), []);

  const openDrawerGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onStart(() => {
      runOnJS(setRendered)(true);
    })
    .onUpdate((e) => {
      const next = Math.min(1, Math.max(0, e.translationX / DRAWER_WIDTH));
      drawerProgress.value = next;
    })
    .onEnd((e) => {
      const shouldOpen =
        e.translationX > DRAWER_WIDTH * 0.4 || e.velocityX > OPEN_VELOCITY_THRESHOLD;
      if (shouldOpen) {
        drawerProgress.value = withSpring(1, { ...motion.spatialDefault, reduceMotion: ReduceMotion.Never });
      } else {
        drawerProgress.value = withSpring(0, { ...motion.spatialFast, reduceMotion: ReduceMotion.Never }, (finished) => {
          if (finished) runOnJS(setRendered)(false);
        });
      }
    });

  return (
    <ScreenContainer>
      <GestureDetector gesture={openDrawerGesture}>
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
          <View
            style={{
              height: 56,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Avatar
              name={user?.nickname ?? '?'}
              size={40}
              onPress={openDrawer}
            />
            <Text variant="titleLarge" color={colors.primary} style={{ fontWeight: '700' }}>
              recognizer
            </Text>
            <IconButton
              icon="plus"
              variant="standard"
              onPress={() => setAddMenuOpen(true)}
            />
          </View>

          {rooms.length === 0 ? (
            <EmptyRoomActions
              onJoin={() => setJoinSheetOpen(true)}
              onCreate={() => setCreateSheetOpen(true)}
            />
          ) : (
            <FlatList
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 12 }}
              data={rooms}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              renderItem={({ item }) => (
                <RoomCard room={item} onPress={() => router.push(`/room/${item.id}` as any)} />
              )}
            />
          )}
        </View>
      </GestureDetector>

      <DropdownMenu
        visible={addMenuOpen}
        onClose={() => setAddMenuOpen(false)}
        items={addMenuItems}
        anchor={{ top: 72, right: 20 }}
      />

      <ProfileDrawer
        rendered={drawerRendered}
        progress={drawerProgress}
        onClose={closeDrawer}
        user={user}
        onLogout={logout}
      />

      <CreateRoomSheet visible={createSheetOpen} onClose={() => setCreateSheetOpen(false)} />
      <JoinRoomSheet visible={joinSheetOpen} onClose={() => setJoinSheetOpen(false)} />
    </ScreenContainer>
  );
}
