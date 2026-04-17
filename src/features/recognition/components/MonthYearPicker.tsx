import { shape, useTheme } from '@/design';
import { Text } from '@/src/components/ui';
import { useEffect, useMemo, useRef } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

type MonthYearPickerProps = {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
};

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 5; // center + 2 above + 2 below
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const YEAR_RANGE = 10; // current year 짹10

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type WheelProps = {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

function Wheel({ items, selectedIndex, onSelect }: WheelProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  // Track whether we have done the initial position sync (avoid animated scroll on first mount)
  const hasInitializedRef = useRef(false);
  // Guard so onMomentumScrollEnd triggered by our own programmatic scrollTo doesn't loop
  const programmaticSnapRef = useRef(false);
  // Debounce timer for web fallback (web ScrollView often doesn't fire onMomentumScrollEnd)
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync scroll position when selectedIndex changes externally (e.g. parent updates)
  useEffect(() => {
    const targetY = selectedIndex * ITEM_HEIGHT;
    scrollRef.current?.scrollTo({ y: targetY, animated: hasInitializedRef.current });
    hasInitializedRef.current = true;
  }, [selectedIndex]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  const settle = (offsetY: number) => {
    const idx = Math.max(
      0,
      Math.min(items.length - 1, Math.round(offsetY / ITEM_HEIGHT)),
    );
    const targetY = idx * ITEM_HEIGHT;

    // Always snap to the precise slot ??fixes the "stops mid-item" bug,
    // especially on web where snapToInterval is not reliably enforced.
    if (Math.abs(offsetY - targetY) > 0.5) {
      programmaticSnapRef.current = true;
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }

    if (idx !== selectedIndex) onSelect(idx);
  };

  const scheduleSettle = (offsetY: number) => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    // Wait briefly for momentum to finish; on web there's typically no momentum
    // so this also doubles as the "scroll ended" signal.
    settleTimerRef.current = setTimeout(() => settle(offsetY), 120);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (Platform.OS !== 'web') return;
    // Web fallback ??debounce & snap when the user stops scrolling
    if (programmaticSnapRef.current) return;
    scheduleSettle(e.nativeEvent.contentOffset.y);
  };

  const handleScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (programmaticSnapRef.current) return;
    // Native usually emits onMomentumScrollEnd next, but if velocity is ~0 it won't.
    // Schedule a settle as a safety net; momentum-end will preempt it.
    scheduleSettle(e.nativeEvent.contentOffset.y);
  };

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    if (programmaticSnapRef.current) {
      programmaticSnapRef.current = false;
      return;
    }
    settle(e.nativeEvent.contentOffset.y);
  };

  const padTop = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;
  const padBottom = padTop;

  return (
    <View style={{ flex: 1, height: PICKER_HEIGHT, position: 'relative' }}>
      {/* Center highlight */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: padTop,
          left: 8,
          right: 8,
          height: ITEM_HEIGHT,
          borderRadius: shape.medium,
          backgroundColor: colors.primaryContainer,
        }}
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        scrollEventThrottle={16}
        nestedScrollEnabled
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{ paddingTop: padTop, paddingBottom: padBottom }}
      >
        {items.map((label, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <Pressable
              key={`${label}-${idx}`}
              onPress={() => {
                // Tapping an item also selects it (improves usability on web)
                programmaticSnapRef.current = true;
                scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
                if (idx !== selectedIndex) onSelect(idx);
              }}
              style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text
                variant="bodyLarge"
                color={isSelected ? colors.onPrimaryContainer : colors.onSurfaceVariant}
                style={{ fontWeight: isSelected ? '600' : '400' }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function MonthYearPicker({ year, month, onChange }: MonthYearPickerProps) {
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear - YEAR_RANGE; y <= currentYear + YEAR_RANGE; y++) arr.push(y);
    return arr;
  }, [currentYear]);

  const monthLabels = MONTH_NAMES;
  const monthIndex = month - 1;
  const yearIndex = years.findIndex((y) => y === year);
  const safeYearIndex = yearIndex >= 0 ? yearIndex : Math.floor(years.length / 2);

  return (
    <View
      style={{
        flexDirection: 'row',
        height: PICKER_HEIGHT,
        paddingHorizontal: 16,
      }}
    >
      <Wheel
        items={monthLabels}
        selectedIndex={monthIndex}
        onSelect={(idx) => onChange(year, idx + 1)}
      />
      <Wheel
        items={years.map(String)}
        selectedIndex={safeYearIndex}
        onSelect={(idx) => onChange(years[idx], month)}
      />
    </View>
  );
}

