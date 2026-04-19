import { shape, useTheme } from '@/design';
import { IconButton } from '@/src/components/ui';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function MessageInput({ onSend, disabled }: Props) {
  const { colors } = useTheme();
  const [value, setValue] = useState('');

  const canSend = value.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(value);
    setValue('');
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.outlineVariant,
      }}
    >
      <IconButton icon="plus" variant="standard" disabled />
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surfaceContainerHigh,
          borderRadius: shape.large,
          paddingHorizontal: 14,
          paddingVertical: 8,
          minHeight: 40,
          maxHeight: 120,
          justifyContent: 'center',
        }}
      >
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="메시지 입력..."
          placeholderTextColor={colors.onSurfaceVariant}
          multiline
          style={{
            color: colors.onSurface,
            fontSize: 15,
            lineHeight: 20,
            padding: 0,
            margin: 0,
          }}
        />
      </View>
      <IconButton
        icon="send"
        variant={canSend ? 'filled' : 'standard'}
        onPress={handleSend}
        disabled={!canSend}
      />
    </View>
  );
}
