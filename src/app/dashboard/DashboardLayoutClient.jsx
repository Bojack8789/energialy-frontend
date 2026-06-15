'use client';

import { usePathname } from 'next/navigation';
import SideBar from './components/SideBar';

export default function DashboardLayoutClient({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/dashboard/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', paddingTop: 64 }}>
      <SideBar />
      <div style={{ flex: 1, width: 0, overflowX: 'hidden', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
