import { Card, IconButton, Text } from '@/src/components/ui';
import { shape, useTheme } from '@/design';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { View } from 'react-native';

type InviteCodeCardProps = {
  inviteCode: string;
};

// Always-visible invite code card for the room settings screen.
export function InviteCodeCard({ inviteCode }: InviteCodeCardProps) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card variant="filled" padding={20} style={{ backgroundColor: colors.primaryContainer }}>
      <Text variant="labelLarge" color={colors.onPrimaryContainer}>초대코드</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <View
          style={{
            backgroundColor: colors.surfaceContainerLowest,
            borderRadius: shape.medium,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flex: 1,
            marginRight: 12,
          }}
        >
          <Text variant="headlineSmall" style={{ letterSpacing: 4, textAlign: 'center' }}>
            {inviteCode}
          </Text>
        </View>
        <IconButton
          icon={copied ? 'check' : 'content-copy'}
          variant="tonal"
          onPress={handleCopy}
        />
      </View>
      <Text variant="bodySmall" color={colors.onPrimaryContainer} style={{ marginTop: 12 }}>
        {copied ? '복사되었습니다!' : '이 코드를 친구에게 공유하세요!'}
      </Text>
    </Card>
  );
}

// Backward-compat wrapper: older code renders a Modal version.
// Now it's just a no-op when visible=false; when visible=true it renders the card inline.
type InviteCodeModalProps = {
  visible: boolean;
  inviteCode: string;
  onClose: () => void;
};

export function InviteCodeModal({ visible, inviteCode }: InviteCodeModalProps) {
  if (!visible) return null;
  return (
    <View style={{ marginTop: 16 }}>
      <InviteCodeCard inviteCode={inviteCode} />
    </View>
  );
}
