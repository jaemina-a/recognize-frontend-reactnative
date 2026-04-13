import { type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenContainerProps = ViewProps;

export function ScreenContainer({ className = '', ...props }: ScreenContainerProps) {
  return (
    <SafeAreaView className={`flex-1 bg-white ${className}`} {...props} />
  );
}
