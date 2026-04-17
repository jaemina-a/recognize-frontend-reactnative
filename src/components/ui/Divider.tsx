import { useTheme } from '@/design';
import { View } from 'react-native';

type DividerProps = {
  vertical?: boolean;
  inset?: number;
};

export function Divider({ vertical, inset = 0 }: DividerProps) {
  const { colors } = useTheme();
  if (vertical) {
    return <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: colors.outlineVariant, marginVertical: inset }} />;
  }
  return <View style={{ height: 1, backgroundColor: colors.outlineVariant, marginHorizontal: inset }} />;
}
