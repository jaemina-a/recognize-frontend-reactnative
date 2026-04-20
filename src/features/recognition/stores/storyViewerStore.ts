import { create } from 'zustand';

type StoryViewerState = {
  visible: boolean;
  roomId: string | null;
  date: string | null;
  initialIndex: number;
  open: (params: { roomId: string; date: string; initialIndex?: number }) => void;
  close: () => void;
};

export const useStoryViewerStore = create<StoryViewerState>((set) => ({
  visible: false,
  roomId: null,
  date: null,
  initialIndex: 0,
  open: ({ roomId, date, initialIndex = 0 }) =>
    set({ visible: true, roomId, date, initialIndex }),
  close: () => set({ visible: false }),
}));
