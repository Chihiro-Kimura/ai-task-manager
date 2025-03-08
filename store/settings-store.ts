import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FontSize = 'small' | 'medium' | 'large';
export type Language = 'ja' | 'en';
export type TimeZone = 'Asia/Tokyo' | 'UTC' | 'America/Los_Angeles';

export interface NotificationSettings {
  taskDue: boolean;
  mentions: boolean;
  system: boolean;
  email: boolean;
}

interface SettingsState {
  fontSize: FontSize;
  language: Language;
  timeZone: TimeZone;
  notifications: NotificationSettings;
  setFontSize: (size: FontSize) => void;
  setLanguage: (lang: Language) => void;
  setTimeZone: (zone: TimeZone) => void;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 'medium',
      language: 'ja',
      timeZone: 'Asia/Tokyo',
      notifications: {
        taskDue: true,
        mentions: true,
        system: true,
        email: false,
      },
      setFontSize: (size) => set({ fontSize: size }),
      setLanguage: (lang) => set({ language: lang }),
      setTimeZone: (zone) => set({ timeZone: zone }),
      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),
    }),
    {
      name: 'app-settings',
    }
  )
); 