import { Text } from '@/src/components/ui';
import { Pressable, View } from 'react-native';

type SocialLoginButtonProps = {
  provider: 'kakao' | 'google';
  onPress: () => void;
};

export function SocialLoginButton({ provider, onPress }: SocialLoginButtonProps) {
  const label = provider === 'kakao' ? '카카오로 시작하기' : 'Google로 시작하기';

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-center py-4 px-6 rounded-xl border border-gray-300 bg-white mb-3"
    >
      {/* TODO: 소셜 로고 아이콘 추가 */}
      <View className="w-6 h-6 bg-gray-300 rounded mr-3" />
      <Text className="text-base font-semibold">{label}</Text>
    </Pressable>
  );
}
