import { elevation, shape, useTheme } from '@/design';
import { Pressable, Modal as RNModal, View, type ModalProps as RNModalProps } from 'react-native';
import { Text } from './Text';

type ModalProps = RNModalProps & {
  title?: string;
  onClose: () => void;
};

export function Modal({ title, onClose, children, ...props }: ModalProps) {
  const { colors } = useTheme();
  return (
    <RNModal transparent animationType="fade" {...props}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.32)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
      >
        <View
          style={[
            {
              backgroundColor: colors.surfaceContainerHigh,
              borderRadius: shape.extraLarge,
              padding: 24,
              width: '100%',
              maxWidth: 560,
            },
            elevation(3),
          ]}
        >
          {title && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text variant="titleLarge">{title}</Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Text style={{ fontSize: 22, color: colors.onSurfaceVariant }}>✕</Text>
              </Pressable>
            </View>
          )}
          {children}
        </View>
      </View>
    </RNModal>
  );
}
