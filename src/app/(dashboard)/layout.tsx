'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const fullBleedRoutes = [
    '/content/posts/canvas',
    '/messaging/conversations',
    '/messaging/configuration',
    '/ai-hub',
    '/settings',
    '/reports',
    '/content/posts'
  ];

  const isFullBleed = fullBleedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-layout-bg)] transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        <main className={`flex-1 overflow-y-auto bg-[var(--color-bg-tint)] rounded-l-[1.25rem] shadow-[-4px_0_24px_-8px_rgba(0,0,0,0.05)] border-y border-l border-[var(--color-border)] ${isFullBleed ? 'p-0' : 'p-4 lg:p-6'} transition-all duration-300 relative z-10`}>
          {children}
        </main>
      </div>
    </div>
  );
}
