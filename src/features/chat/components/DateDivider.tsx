import { useTheme } from '@/design';
import { Text } from '@/src/components/ui';
import { View } from 'react-native';
import { formatDateLabel } from '../utils/messageGrouping';

type Props = { date: Date };

export function DateDivider({ date }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: colors.outlineVariant }} />
      <Text
        variant="labelSmall"
        color={colors.onSurfaceVariant}
        style={{ marginHorizontal: 12 }}
      >
        {formatDateLabel(date)}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.outlineVariant }} />
    </View>
  );
}
