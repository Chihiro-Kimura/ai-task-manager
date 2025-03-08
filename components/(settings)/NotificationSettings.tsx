'use client';

import { Bell, Mail, MessageSquare, Timer } from 'lucide-react';
import { type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/store/settings-store';

export function NotificationSettings(): ReactNode {
  const { notifications, updateNotifications } = useSettingsStore();

  const notificationTypes = [
    {
      id: 'taskDue',
      label: 'タスクの期限通知',
      description: 'タスクの期限が近づいた時に通知します。',
      icon: Timer,
    },
    {
      id: 'mentions',
      label: 'メンション通知',
      description: 'タスクやメモでメンションされた時に通知します。',
      icon: MessageSquare,
    },
    {
      id: 'system',
      label: 'システム通知',
      description: '重要なシステムの更新や変更を通知します。',
      icon: Bell,
    },
    {
      id: 'email',
      label: 'メール通知',
      description: '重要な通知をメールでも受け取ります。',
      icon: Mail,
    },
  ] as const;

  const handleToggle = (id: keyof typeof notifications) => {
    updateNotifications({ [id]: !notifications[id] });
  };

  const handleEnableAll = () => {
    updateNotifications({
      taskDue: true,
      mentions: true,
      system: true,
      email: true,
    });
  };

  const handleDisableAll = () => {
    updateNotifications({
      taskDue: false,
      mentions: false,
      system: false,
      email: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleDisableAll}>
          すべてオフ
        </Button>
        <Button variant="outline" size="sm" onClick={handleEnableAll}>
          すべてオン
        </Button>
      </div>

      <div className="space-y-4">
        {notificationTypes.map(({ id, label, description, icon: Icon }) => (
          <div key={id} className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 mt-1 text-muted-foreground" />
              <div className="space-y-0.5">
                <label className="text-sm font-medium">{label}</label>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <Switch
              checked={notifications[id as keyof typeof notifications]}
              onCheckedChange={() => handleToggle(id as keyof typeof notifications)}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 