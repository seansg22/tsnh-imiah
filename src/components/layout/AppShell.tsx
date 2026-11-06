import { type ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { pageBg } from '../shared/cardStyle';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={`relative w-full max-w-[430px] mx-auto min-h-screen ${pageBg} overflow-x-clip`}>
      <div style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
