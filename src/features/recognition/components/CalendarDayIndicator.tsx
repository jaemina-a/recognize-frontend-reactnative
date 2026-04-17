import { View } from 'react-native';

// TODO: dot을 아이콘으로 교체 예정
export type IndicatorType = 'dot' | 'icon';

export const INDICATOR_HEIGHT = 8;

type CalendarDayIndicatorProps = {
  colors: string[];
  type?: IndicatorType; // 기본값: 'dot'
  // TODO: 아이콘 전환 시 추가될 props
  // icons?: string[];
};

export function CalendarDayIndicator({ colors, type = 'dot' }: CalendarDayIndicatorProps) {
  // 컨테이너는 항상 동일한 높이를 차지하여 셀 높이가 변하지 않도록 함
  // TODO: type === 'icon' 일 때 아이콘 렌더링으로 교체 예정
  return (
    <View
      style={{
        height: INDICATOR_HEIGHT,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        marginTop: 4,
      }}
    >
      {colors.map((color, index) => (
        <View key={index} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      ))}
    </View>
  );
}
