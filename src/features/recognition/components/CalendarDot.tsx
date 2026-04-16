import { View } from 'react-native';

type CalendarDotProps = {
  colors: string[];
};

export function CalendarDot({ colors }: CalendarDotProps) {
  if (colors.length === 0) return null;

  return (
    <View className="flex-row justify-center gap-0.5 mt-1">
      {colors.map((color, index) => (
        <View
          key={index}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </View>
  );
}
