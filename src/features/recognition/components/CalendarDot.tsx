import { View } from 'react-native';

type CalendarDotProps = {
  colors: string[];
};

export function CalendarDot({ colors }: CalendarDotProps) {
  if (colors.length === 0) return null;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 2, marginTop: 4 }}>
      {colors.map((color, index) => (
        <View key={index} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      ))}
    </View>
  );
}
