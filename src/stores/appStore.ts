import { create } from 'zustand';

type AppState = {
  currentRoomId: string | null;
  setCurrentRoom: (roomId: string) => void;
  clearCurrentRoom: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  currentRoomId: null,
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),
  clearCurrentRoom: () => set({ currentRoomId: null }),
}));
