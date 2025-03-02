import { type ReactElement } from 'react';

import Header from '@/components/(dashboard)/Header';
import { Sidebar } from '@/components/(dashboard)/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps): ReactElement {
  return (
    <div className="fixed inset-0 bg-black">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">
            <div className="container mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
