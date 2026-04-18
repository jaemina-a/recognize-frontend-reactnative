import { ScreenContainer } from '@/src/components/layout';
import { Avatar, DropdownMenu, IconButton, Text, type DropdownMenuItem } from '@/src/components/ui';
import { useTheme } from '@/design';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import {
  CreateRoomSheet,
  EmptyRoomActions,
  JoinRoomSheet,
  ProfileDrawer,
} from '@/src/features/main/components';
import { useAuthStore } from '@/src/stores/authStore';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useRoomList } from '../hooks/useRoomList';
import { RoomCard } from './RoomCard';

const DRAWER_OPEN_TRANSLATE_THRESHOLD = 60;
const DRAWER_OPEN_VELOCITY_THRESHOLD = 300;

export function RoomListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { rooms, refetch } = useRoomList();
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [joinSheetOpen, setJoinSheetOpen] = useState(false);

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

  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  // 화면 좌→우 스와이프로 드로어 열기.
  // activeOffsetX로 수평 임계값을 두어 FlatList의 수직 스크롤과 충돌 방지.
  const openDrawerGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onEnd((e) => {
      if (
        e.translationX > DRAWER_OPEN_TRANSLATE_THRESHOLD &&
        e.velocityX > DRAWER_OPEN_VELOCITY_THRESHOLD
      ) {
        runOnJS(openDrawer)();
      }
    });

  return (
    <ScreenContainer>
      <GestureDetector gesture={openDrawerGesture}>
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
          {/* App bar */}
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
              onPress={() => setDrawerOpen(true)}
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

          {/* 본문: 방 0개면 빈 상태 UI, 아니면 FlatList */}
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

      {/* + 메뉴: 방 만들기 / 방 참가하기 */}
      <DropdownMenu
        visible={addMenuOpen}
        onClose={() => setAddMenuOpen(false)}
        items={addMenuItems}
        anchor={{ top: 72, right: 20 }}
      />

      {/* 좌측 슬라이드 드로어 (프로필 + 로그아웃) */}
      <ProfileDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        onLogout={logout}
      />

      {/* 방 만들기 / 참가 BottomSheet */}
      <CreateRoomSheet visible={createSheetOpen} onClose={() => setCreateSheetOpen(false)} />
      <JoinRoomSheet visible={joinSheetOpen} onClose={() => setJoinSheetOpen(false)} />
    </ScreenContainer>
  );
}
