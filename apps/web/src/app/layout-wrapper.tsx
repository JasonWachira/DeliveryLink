
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <div className="grid grid-rows-[auto_1fr] h-svh">
      {!isDashboard && <Header />}
      <main className={isDashboard ? '' : 'pt-20'}>
        {children}
      </main>
    </div>
  );
}
