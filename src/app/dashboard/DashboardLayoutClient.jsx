'use client';

import { usePathname } from 'next/navigation';
import SideBar from './components/SideBar';
import Footer from '@/app/components/Footer';

export default function DashboardLayoutClient({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/dashboard/admin');
  const isInbox = pathname?.startsWith('/dashboard/inbox');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f9fafb', paddingTop: 64 }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <SideBar />
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
      {!isInbox && <Footer />}
    </div>
  );
}
