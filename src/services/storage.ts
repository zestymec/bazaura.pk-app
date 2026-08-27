import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryFallback = new Map<string, string>();

export const storage = {
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value) as T;
      }
      const memVal = memoryFallback.get(key);
      if (memVal !== undefined) {
        return JSON.parse(memVal) as T;
      }
      return defaultValue;
    } catch {
      const memVal = memoryFallback.get(key);
      return memVal ? (JSON.parse(memVal) as T) : defaultValue;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      memoryFallback.set(key, serialized);
      await AsyncStorage.setItem(key, serialized);
    } catch {
      // Memory fallback preserved
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      memoryFallback.delete(key);
      await AsyncStorage.removeItem(key);
    } catch {
      // Memory fallback cleaned
    }
  },

  async clear(): Promise<void> {
    try {
      memoryFallback.clear();
      await AsyncStorage.clear();
    } catch {
      // Cleared
    }
  },
};
