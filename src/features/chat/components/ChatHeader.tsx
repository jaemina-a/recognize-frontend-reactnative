import { useTheme } from '@/design';
import { IconButton, Text } from '@/src/components/ui';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function ChatHeader({ title, subtitle, onBack }: Props) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.outlineVariant,
      }}
    >
      <IconButton
        icon="arrow-left"
        variant="standard"
        onPress={() => (onBack ? onBack() : router.back())}
      />
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Text variant="titleMedium" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" color={colors.onSurfaceVariant} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
