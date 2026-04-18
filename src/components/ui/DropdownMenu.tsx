import { elevation, shape, useTheme } from '@/design';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Pressable, View } from 'react-native';
import { Text } from './Text';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type DropdownMenuItem = {
  label: string;
  icon?: IconName;
  onPress: () => void;
  destructive?: boolean;
};

type DropdownMenuProps = {
  visible: boolean;
  onClose: () => void;
  items: DropdownMenuItem[];
  // Anchor position (top-right by default)
  anchor?: { top: number; right?: number; left?: number };
};

// M3-style dropdown menu rendered as an overlay with a positioned sheet.
export function DropdownMenu({ visible, onClose, items, anchor }: DropdownMenuProps) {
  const { colors } = useTheme();
  const top = anchor?.top ?? 64;
  const right = anchor?.right ?? 16;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <View
          style={[
            {
              position: 'absolute',
              top,
              right: anchor?.left == null ? right : undefined,
              left: anchor?.left,
              minWidth: 200,
              backgroundColor: colors.surfaceContainer,
              borderRadius: shape.small,
              paddingVertical: 8,
            },
            elevation(2),
          ]}
        >
          {items.map((item, idx) => {
            const fg = item.destructive ? colors.error : colors.onSurface;
            return (
              <Pressable
                key={idx}
                onPress={() => {
                  onClose();
                  // defer to next tick so modal can close cleanly
                  setTimeout(item.onPress, 0);
                }}
                cssInterop={false}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: pressed ? colors.surfaceContainerHighest : 'transparent',
                })}
              >
                {item.icon ? (
                  <MaterialCommunityIcons name={item.icon} size={20} color={fg} style={{ marginRight: 12 }} />
                ) : null}
                <Text variant="bodyLarge" color={fg}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}
