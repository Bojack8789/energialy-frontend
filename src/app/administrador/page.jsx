"use client";

import { useEffect } from 'react';
import getLocalStorage from '../Func/localStorage';
import TailAdminLayout from '../components/SuperAdmin/TailAdminLayout';
import SuperAdminDashboard from '../dashboard/components/SuperAdminDashboard';

export default function AdminPage() {
  const user = typeof window !== 'undefined' ? getLocalStorage() : null;

  useEffect(() => {
    const u = getLocalStorage();
    if (!u) {
      window.location.href = '/login';
      return;
    }
    if (u.role !== 'superAdmin' && u.role !== 'admin') {
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <TailAdminLayout>
      <SuperAdminDashboard user={user} />
    </TailAdminLayout>
  );
}
