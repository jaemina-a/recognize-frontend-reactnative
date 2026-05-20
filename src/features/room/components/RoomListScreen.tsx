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
import { FlatList, Image, View, Alert } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring, ReduceMotion } from 'react-native-reanimated';
import { useRoomList } from '../hooks/useRoomList';
import { RoomCard } from './RoomCard';

const OPEN_VELOCITY_THRESHOLD = 500;

export function RoomListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { rooms, refetch } = useRoomList();
  const { logout, deleteAccount } = useAuth();
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
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
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
            <Image
              source={require('@/assets/images/cloud-logo.png')}
              style={{ width: 90, height: 90 }}
              resizeMode="contain"
            />
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
        onDeleteAccount={() => {
          Alert.alert(
            '계정 삭제',
            '이 작업은 되돌릴 수 없습니다.\n\n• 계정 사용이 중단되고 개인정보가 익명화됩니다.\n• 등록한 사진과 채팅은 다른 함께한 멤버를 위해 보존됩니다.\n• Apple 계정의 경우 Apple 연결도 해제됩니다.\n\n정말로 삭제하시겠습니까?',
            [
              { text: '취소', style: 'cancel' },
              {
                text: '삭제',
                style: 'destructive',
                onPress: () => {
                  Alert.alert(
                    '다시 한 번 확인',
                    '계정을 의해서 삭제합니까?',
                    [
                      { text: '취소', style: 'cancel' },
                      {
                        text: '삭제',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await deleteAccount();
                          } catch (e) {
                            Alert.alert('삭제 실패', '계정 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                            console.error('[DELETE_ACCOUNT][X]', e);
                          }
                        },
                      },
                    ],
                  );
                },
              },
            ],
          );
        }}
      />

      <CreateRoomSheet visible={createSheetOpen} onClose={() => setCreateSheetOpen(false)} />
      <JoinRoomSheet visible={joinSheetOpen} onClose={() => setJoinSheetOpen(false)} />
    </ScreenContainer>
  );
}
