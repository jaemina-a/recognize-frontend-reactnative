import { useTheme } from '@/design';
import { Text } from '@/src/components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

type Props = {
  onJoin: () => void;
  onCreate: () => void;
};

/**
 * 방 0개일 때 표시되는 빈 상태 UI.
 * 원형 큰 버튼 2개("참가" / "생성")를 가로로 나열한다.
 */
export function EmptyRoomActions({ onJoin, onCreate }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}
    >
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Text variant="titleMedium" color={colors.onSurface}>
          아직 참여한 방이 없어요
        </Text>
        <Text
          variant="bodySmall"
          color={colors.onSurfaceVariant}
          style={{ marginTop: 4, textAlign: 'center' }}
        >
          방을 만들거나 초대코드로 참가해보세요
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* 참가 */}
        <View style={{ alignItems: 'center', marginHorizontal: 16 }}>
          <Pressable
            onPress={onJoin}
            accessibilityRole="button"
            accessibilityLabel="초대코드로 참가"
            cssInterop={false}
            style={({ pressed }) => ({
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.secondaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons
              name="ticket-confirmation-outline"
              size={40}
              color={colors.onSecondaryContainer}
            />
          </Pressable>
          <Text variant="labelLarge" color={colors.onSurface} style={{ marginTop: 12 }}>
            참가
          </Text>
        </View>

        {/* 생성 */}
        <View style={{ alignItems: 'center', marginHorizontal: 16 }}>
          <Pressable
            onPress={onCreate}
            accessibilityRole="button"
            accessibilityLabel="새 방 만들기"
            cssInterop={false}
            style={({ pressed }) => ({
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons
              name="home-plus-outline"
              size={40}
              color={colors.onPrimaryContainer}
            />
          </Pressable>
          <Text variant="labelLarge" color={colors.onSurface} style={{ marginTop: 12 }}>
            생성
          </Text>
        </View>
      </View>
    </View>
  );
}
