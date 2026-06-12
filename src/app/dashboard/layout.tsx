import React from 'react';
import MobileNavBar from '@/components/navigation/MobileNavBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">
      <div className="flex-grow">{children}</div>
      <MobileNavBar />
    </div>
  );
}
