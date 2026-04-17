import { useTheme } from '@/design';
import { ActivityIndicator, View } from 'react-native';

type LoadingProps = {
  fullScreen?: boolean;
};

export function Loading({ fullScreen = false }: LoadingProps) {
  const { colors } = useTheme();
  if (fullScreen) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return <ActivityIndicator size="small" color={colors.primary} />;
}
