import { ScreenContainer } from '@/src/components/layout';
import { Avatar, Card, DropdownMenu, IconButton, Text, type DropdownMenuItem } from '@/src/components/ui';
import { useTheme } from '@/design';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { useAuthStore } from '@/src/stores/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';
import { useRoomList } from '../hooks/useRoomList';
import { RoomCard } from './RoomCard';

export function RoomListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { rooms, refetch } = useRoomList();
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const menuItems: DropdownMenuItem[] = [
    {
      label: '프로필',
      icon: 'account-outline',
      onPress: () => Alert.alert('준비 중', '프로필 화면은 준비 중입니다.'),
    },
    {
      label: '설정',
      icon: 'cog-outline',
      onPress: () => Alert.alert('준비 중', '설정 화면은 준비 중입니다.'),
    },
    {
      label: '로그아웃',
      icon: 'logout',
      destructive: true,
      onPress: logout,
    },
  ];

  return (
    <ScreenContainer>
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
            onPress={() => Alert.alert('준비 중', '프로필 화면은 준비 중입니다.')}
          />
          <Text variant="titleLarge" color={colors.primary} style={{ fontWeight: '700' }}>
            recognizer
          </Text>
          <IconButton
            icon="dots-vertical"
            variant="standard"
            onPress={() => setMenuOpen(true)}
          />
        </View>

        {/* Room list with "+ 새 방 만들기" card pinned at top */}
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 12 }}
          data={rooms}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListHeaderComponent={
            <View style={{ marginBottom: 12 }}>
              <Pressable
                onPress={() => router.push('/(main)/create-room' as any)}
                cssInterop={false}
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
              >
                <Card variant="filled" padding={16} style={{ backgroundColor: colors.primaryContainer }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="plus-circle-outline" size={28} color={colors.onPrimaryContainer} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text variant="titleMedium" color={colors.onPrimaryContainer}>
                        새 방 만들기
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <RoomCard
              room={item}
              onPress={() => router.push(`/room/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
              <Text variant="bodyMedium" color={colors.onSurfaceVariant}>아직 참여한 방이 없어요</Text>
              <Text variant="bodySmall" color={colors.onSurfaceVariant} style={{ marginTop: 4 }}>
                방을 만들거나 초대코드로 참가해보세요!
              </Text>
            </View>
          }
        />

        {/* 초대코드 참가 (outlined, bottom) */}
        <View style={{ paddingBottom: 16, paddingTop: 8 }}>
          <Pressable
            onPress={() => router.push('/room/join' as any)}
            cssInterop={false}
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.outline,
                borderRadius: 9999,
                paddingVertical: 14,
              }}
            >
              <MaterialCommunityIcons name="ticket-confirmation-outline" size={20} color={colors.primary} />
              <Text variant="labelLarge" color={colors.primary} style={{ marginLeft: 8 }}>
                초대코드로 참가
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <DropdownMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={menuItems}
        anchor={{ top: 72, right: 20 }}
      />
    </ScreenContainer>
  );
}
