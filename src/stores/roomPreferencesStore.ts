import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type FeedMode = 'vertical' | 'story';

type RoomPrefs = {
  feedMode: FeedMode;
};

type RoomPreferencesState = {
  prefsByRoom: Record<string, RoomPrefs>;
  getFeedMode: (roomId: string) => FeedMode;
  setFeedMode: (roomId: string, mode: FeedMode) => void;
};

const DEFAULT_FEED_MODE: FeedMode = 'vertical';

export const useRoomPreferencesStore = create<RoomPreferencesState>()(
  persist(
    (set, get) => ({
      prefsByRoom: {},
      getFeedMode: (roomId) =>
        get().prefsByRoom[roomId]?.feedMode ?? DEFAULT_FEED_MODE,
      setFeedMode: (roomId, mode) =>
        set((state) => ({
          prefsByRoom: {
            ...state.prefsByRoom,
            [roomId]: { ...state.prefsByRoom[roomId], feedMode: mode },
          },
        })),
    }),
    {
      name: 'room-preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
