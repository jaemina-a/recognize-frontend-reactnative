import { Card, Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';

type EmptyMemberCardProps = {
  nickname: string;
  color?: string;
};

// Shown for members in the room who have not uploaded a photo yet today.
export function EmptyMemberCard({ nickname, color }: EmptyMemberCardProps) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Card
        padding={0}
        style={{
          height: 192,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: colors.outlineVariant,
          overflow: 'hidden',
        }}
      >
        <MaterialCommunityIcons name="camera-outline" size={36} color={colors.onSurfaceVariant} />
        <Text variant="bodyMedium" color={colors.onSurfaceVariant} style={{ marginTop: 8 }}>
          아직 인증하지 않았어요
        </Text>
        {/* 이름 + 점 — 카드 내부 좌측 상단 */}
        <View style={{
          position: 'absolute',
          top: 12,
          left: 12,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.35)',
          borderRadius: 20,
          paddingHorizontal: 8,
          paddingVertical: 4,
        }}>
          {color ? (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 6 }} />
          ) : null}
          <Text variant="labelMedium" style={{ color: '#fff' }}>{nickname}</Text>
        </View>
      </Card>
    </View>
  );
}
