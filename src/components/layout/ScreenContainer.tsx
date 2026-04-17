import { useTheme } from '@/design';
import { type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenContainerProps = ViewProps;

export function ScreenContainer({ style, ...props }: ScreenContainerProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
      {...props}
    />
  );
}
