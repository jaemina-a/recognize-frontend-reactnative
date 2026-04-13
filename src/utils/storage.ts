// TODO: AsyncStorage 래퍼 구현
// 와이어프레임 단계에서는 placeholder

export const storage = {
  get: async (key: string): Promise<string | null> => {
    // TODO: AsyncStorage.getItem(key)
    return null;
  },
  set: async (key: string, value: string): Promise<void> => {
    // TODO: AsyncStorage.setItem(key, value)
  },
  remove: async (key: string): Promise<void> => {
    // TODO: AsyncStorage.removeItem(key)
  },
};
