import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // 初期値の設定
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    // 既存のデータをクリア（開発時のデバッグ用）
    try {
      const existingData = window.localStorage.getItem(key);
      if (existingData === 'undefined' || existingData === undefined || existingData === null) {
        window.localStorage.removeItem(key);
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        return initialValue;
      }
    } catch (error) {
      console.error('Error clearing invalid data:', error);
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        // 初期値を保存
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        return initialValue;
      }

      try {
        const parsedItem = JSON.parse(item);
        if (parsedItem === null || parsedItem === undefined) {
          window.localStorage.setItem(key, JSON.stringify(initialValue));
          return initialValue;
        }
        return parsedItem;
      } catch (parseError) {
        console.error(`Failed to parse stored value for key "${key}":`, parseError);
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        return initialValue;
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return initialValue;
    }
  });

  // 値の更新と保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error saving to localStorage for key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
} 