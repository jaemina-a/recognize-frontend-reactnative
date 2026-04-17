import { Card, Text } from '@/src/components/ui';
import { useTheme } from '@/design';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

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
        variant="outlined"
        padding={0}
        style={{
          height: 192,
          alignItems: 'center',
          justifyContent: 'center',
          borderStyle: 'dashed',
          borderColor: colors.outlineVariant,
        }}
      >
        <MaterialCommunityIcons name="camera-off-outline" size={36} color={colors.onSurfaceVariant} />
        <Text variant="bodyMedium" color={colors.onSurfaceVariant} style={{ marginTop: 8 }}>
          아직 인증하지 않았어요
        </Text>
      </Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 4 }}>
        {color ? (
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 8 }} />
        ) : null}
        <Text variant="labelLarge" color={colors.onSurfaceVariant}>{nickname}</Text>
      </View>
    </View>
  );
}
