import { useTheme } from '@/design';
import { IconButton, Text } from '@/src/components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

type CalendarHeaderProps = {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onTogglePicker: () => void;
  isPickerOpen: boolean;
};

function formatMonthYear(year: number, month: number) {
  // e.g. "August 2025"
  const d = new Date(year, month - 1, 1);
  const monthName = d.toLocaleString('en-US', { month: 'long' });
  return `${monthName} ${year}`;
}

export function CalendarHeader({
  year,
  month,
  onPrev,
  onNext,
  onTogglePicker,
  isPickerOpen,
}: CalendarHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Pressable
        onPress={onTogglePicker}
        hitSlop={8}
        cssInterop={false}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 8,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text variant="titleMedium" color={colors.onSurface}>
          {formatMonthYear(year, month)}
        </Text>
        <MaterialCommunityIcons
          name={isPickerOpen ? 'menu-up' : 'menu-down'}
          size={24}
          color={colors.onSurfaceVariant}
          style={{ marginLeft: 2 }}
        />
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconButton icon="chevron-left" variant="standard" onPress={onPrev} />
        <IconButton icon="chevron-right" variant="standard" onPress={onNext} />
      </View>
    </View>
  );
}
