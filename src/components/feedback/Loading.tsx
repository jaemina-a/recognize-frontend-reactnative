import { ActivityIndicator, View } from 'react-native';

type LoadingProps = {
  fullScreen?: boolean;
};

export function Loading({ fullScreen = false }: LoadingProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return <ActivityIndicator size="small" color="#000000" />;
}
