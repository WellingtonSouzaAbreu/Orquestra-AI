'use client';

import { ReactNode } from 'react';
import LeftSidebar from './LeftSidebar';

interface AppLayoutProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
}

export default function AppLayout({ children, rightSidebar }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          {rightSidebar}
        </div>
      </main>
    </div>
  );
}
